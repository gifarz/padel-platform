'use server'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireAdmin } from '@/server/guards'
import { normalizeIndonesianPhone } from '@/lib/phone'
import { revalidatePublicSite } from '@/server/revalidate'
import type { FormState } from '@/server/form-state'

/**
 * Creates a login-capable User plus the matching Trainer/Referee profile in
 * one go. Admin sets a temporary password the person changes after first login
 * — there's no "invite by phone" flow yet, so this keeps onboarding to one step.
 */
async function createStaffUser(formData: FormData, role: 'TRAINER' | 'REFEREE') {
  const name = String(formData.get('name') ?? '').trim()
  const rawPhone = String(formData.get('phone') ?? '').trim()
  const districtId = String(formData.get('districtId') ?? '').trim() || undefined
  if (!name || !rawPhone) throw new Error('Nama dan nomor HP wajib diisi.')

  const phone = normalizeIndonesianPhone(rawPhone)
  if (!phone) throw new Error('Nomor HP tidak valid.')

  const exists = await db.user.findUnique({ where: { phone } })
  if (exists) throw new Error('Nomor HP sudah dipakai akun lain.')

  const tempPassword = Math.random().toString(36).slice(2, 10)
  const passwordHash = await bcrypt.hash(tempPassword, 10)
  const user = await db.user.create({ data: { name, phone, passwordHash, role } })
  return { user, districtId, tempPassword }
}

export async function createTrainerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const specialties = String(formData.get('specialties') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    const yearsExp = Number(formData.get('yearsExp') ?? 0)
    const sessionPrice = formData.get('sessionPrice') ? Number(formData.get('sessionPrice')) : undefined
    const { user, districtId, tempPassword } = await createStaffUser(formData, 'TRAINER')
    await db.trainerProfile.create({ data: { userId: user.id, districtId, specialties, yearsExp, sessionPrice } })
    revalidatePath('/admin/trainers')
    // Landing page's "Pelatih Bersertifikat" preview reads this list too.
    revalidatePublicSite()
    return { ok: `Pelatih dibuat. Kata sandi sementara: ${tempPassword}` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal membuat pelatih.' }
  }
}

export async function createRefereeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const certification = String(formData.get('certification') ?? '').trim()
    const yearsExp = Number(formData.get('yearsExp') ?? 0)
    if (!certification) return { error: 'Isi sertifikasi wasit.' }
    const { user, districtId, tempPassword } = await createStaffUser(formData, 'REFEREE')
    await db.refereeProfile.create({ data: { userId: user.id, districtId, certification, yearsExp } })
    revalidatePath('/admin/referees')
    revalidatePublicSite()
    return { ok: `Wasit dibuat. Kata sandi sementara: ${tempPassword}` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal membuat wasit.' }
  }
}

export async function setTrainerStatusAction(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
  await requireAdmin()
  await db.trainerProfile.update({ where: { id }, data: { status } })
  revalidatePath('/admin/trainers')
  revalidatePublicSite()
}

export async function setRefereeStatusAction(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
  await requireAdmin()
  await db.refereeProfile.update({ where: { id }, data: { status } })
  revalidatePath('/admin/referees')
  revalidatePublicSite()
}
