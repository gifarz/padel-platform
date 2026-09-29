'use server'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireAdmin } from '@/server/guards'
import { getAthletesPage } from '@/server/queries'
import { normalizeIndonesianPhone } from '@/lib/phone'
import { revalidatePublicSite } from '@/server/revalidate'
import type { FormState } from '@/server/form-state'

export async function searchAthletesAction(query: string, page: number) {
  await requireAdmin()
  return getAthletesPage(query, page)
}

export async function setAthletesActiveAction(athleteProfileIds: string[], isActive: boolean) {
  await requireAdmin()
  const users = await db.athleteProfile.findMany({ where: { id: { in: athleteProfileIds } }, select: { userId: true } })
  await db.user.updateMany({ where: { id: { in: users.map((u) => u.userId) } }, data: { isActive } })
  revalidatePath('/admin/athletes')
  revalidatePath('/players')
}

/**
 * Registration now happens on this side only — there is no public sign-up
 * form. Admin fills this in, a temp password is generated, and the athlete
 * changes it after their first login (see /settings).
 */
export async function createAthleteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const name = String(formData.get('name') ?? '').trim()
    const rawPhone = String(formData.get('phone') ?? '').trim()
    const username = String(formData.get('username') ?? '').trim().toLowerCase()
    const districtId = String(formData.get('districtId') ?? '').trim()
    const clubId = String(formData.get('clubId') ?? '').trim() || undefined
    const gender = String(formData.get('gender') ?? 'MALE')

    if (!name || !rawPhone || !username || !districtId) {
      return { error: 'Lengkapi nama, nomor HP, username, dan kecamatan.' }
    }
    const phone = normalizeIndonesianPhone(rawPhone)
    if (!phone) return { error: 'Nomor HP tidak valid.' }

    const [phoneExists, usernameExists, district] = await Promise.all([
      db.user.findUnique({ where: { phone } }),
      db.athleteProfile.findUnique({ where: { username } }),
      db.district.findUnique({ where: { id: districtId } }),
    ])
    if (phoneExists) return { error: 'Nomor HP sudah terdaftar.' }
    if (usernameExists) return { error: 'Username sudah dipakai.' }
    if (!district) return { error: 'Kecamatan tidak valid.' }

    const tempPassword = Math.random().toString(36).slice(2, 10)
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    await db.user.create({
      data: {
        name,
        phone,
        passwordHash,
        role: 'ATHLETE',
        athlete: {
          create: {
            username,
            districtId,
            clubId,
            gender: gender as 'MALE' | 'FEMALE',
            rating: 1000, // everyone starts at the Penantang floor
          },
        },
      },
    })

    revalidatePath('/admin/athletes')
    revalidatePath('/players')
    revalidatePath('/ranking')
    if (clubId) revalidatePath(`/clubs`)
    // A new athlete changes the landing page's player count, district
    // distribution map, and ranking preview — all rendered from the DB.
    revalidatePublicSite()
    return { ok: `Atlet dibuat. Kata sandi sementara: ${tempPassword}` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal membuat atlet.' }
  }
}
