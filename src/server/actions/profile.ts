'use server'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireAthlete, requireUser } from '@/server/guards'
import { MIN_PASSWORD_LENGTH } from '@/lib/password-rules'
import type { FormState } from '@/server/form-state'

const HANDS = ['RIGHT', 'LEFT'] as const
const POSITIONS = ['LEFT', 'RIGHT', 'BOTH'] as const

export async function updateMyProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { athleteId } = await requireAthlete()

  // City is a legacy free-text field (admins register athletes by kecamatan), so it must not block saving.
  const city = String(formData.get('city') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const handRaw = String(formData.get('dominantHand') ?? '')
  const posRaw = String(formData.get('preferredPosition') ?? '')

  if (city.length > 80) return { error: 'Kota maksimal 80 karakter.' }
  if (bio.length > 300) return { error: 'Bio maksimal 300 karakter.' }
  if (handRaw && !(HANDS as readonly string[]).includes(handRaw)) return { error: 'Tangan dominan tidak valid.' }
  if (posRaw && !(POSITIONS as readonly string[]).includes(posRaw)) return { error: 'Posisi favorit tidak valid.' }

  const updated = await db.athleteProfile.update({
    where: { id: athleteId },
    data: {
      city: city || null,
      bio: bio || null,
      dominantHand: (handRaw || null) as (typeof HANDS)[number] | null,
      preferredPosition: (posRaw || null) as (typeof POSITIONS)[number] | null,
    },
    select: { username: true },
  })

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  revalidatePath(`/profile/${updated.username}`)
  return { ok: 'Profil tersimpan.' }
}

/**
 * Admins hand out temporary passwords, so every account type (athlete, trainer,
 * referee, admin) needs a way to replace it. Verifies the current password first.
 */
export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { userId } = await requireUser()
  const current = String(formData.get('currentPassword') ?? '')
  const next = String(formData.get('newPassword') ?? '')
  const confirm = String(formData.get('confirmPassword') ?? '')

  if (!current || !next) return { error: 'Isi kata sandi saat ini dan kata sandi baru.' }
  if (next.length < MIN_PASSWORD_LENGTH) return { error: `Kata sandi baru minimal ${MIN_PASSWORD_LENGTH} karakter.` }
  if (next.length > 72) return { error: 'Kata sandi baru maksimal 72 karakter.' } // bcrypt ignores everything past 72 bytes
  if (next !== confirm) return { error: 'Konfirmasi kata sandi tidak cocok.' }
  if (next === current) return { error: 'Kata sandi baru harus berbeda dari yang lama.' }

  const user = await db.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { error: 'Kata sandi saat ini salah.' }

  await db.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(next, 10) } })
  return { ok: 'Kata sandi diperbarui.' }
}
