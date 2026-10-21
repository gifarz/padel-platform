'use server'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireAdmin } from '@/server/guards'
import { getAthletesAdminPage } from '@/server/queries'
import { normalizeIndonesianPhone } from '@/lib/phone'
import { revalidatePublicSite } from '@/server/revalidate'
import { generateTempPassword } from '@/lib/password'
import type { FormState } from '@/server/form-state'

/** Prisma errors can leak table/column names; map the common ones and hide the rest. */
function dbError(err: unknown, fallback: string) {
  const code = typeof err === 'object' && err && 'code' in err ? (err as { code?: string }).code : undefined
  if (code === 'P2002') return 'Nomor HP atau username sudah dipakai.'
  return fallback
}

export async function searchAthletesAction(query: string, page: number) {
  await requireAdmin()
  return getAthletesAdminPage(query, page)
}

export async function setAthletesActiveAction(athleteProfileIds: string[], isActive: boolean) {
  await requireAdmin()
  if (athleteProfileIds.length === 0) return
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
    const genderRaw = String(formData.get('gender') ?? '')

    if (genderRaw !== 'MALE' && genderRaw !== 'FEMALE') return { error: 'Pilih jenis kelamin.' }
    const gender: 'MALE' | 'FEMALE' = genderRaw === 'FEMALE' ? 'FEMALE' : 'MALE'
    if (name.length > 100) return { error: 'Nama terlalu panjang.' }
    if (!/^[a-z0-9._]{3,30}$/.test(username)) return { error: 'Username 3–30 karakter: huruf kecil, angka, titik, atau garis bawah.' }

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
    if (clubId && !(await db.club.findUnique({ where: { id: clubId }, select: { id: true } }))) return { error: 'Klub tidak valid.' }

    const tempPassword = generateTempPassword()
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
            gender,
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
    return { error: dbError(err, 'Gagal membuat atlet.') }
  }
}


export async function updateAthleteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const id = String(formData.get('id') ?? '')
    const name = String(formData.get('name') ?? '').trim()
    const rawPhone = String(formData.get('phone') ?? '').trim()
    const username = String(formData.get('username') ?? '').trim().toLowerCase()
    const districtId = String(formData.get('districtId') ?? '').trim()
    const clubId = String(formData.get('clubId') ?? '').trim() || null
    const gender = String(formData.get('gender') ?? 'MALE') === 'FEMALE' ? 'FEMALE' : 'MALE'

    if (!id) return { error: 'Atlet tidak ditemukan.' }
    if (!name || !rawPhone || !username || !districtId) return { error: 'Lengkapi nama, nomor HP, username, dan kecamatan.' }
    const phone = normalizeIndonesianPhone(rawPhone)
    if (!phone) return { error: 'Nomor HP tidak valid.' }

    const athlete = await db.athleteProfile.findUnique({ where: { id }, select: { userId: true } })
    if (!athlete) return { error: 'Atlet tidak ditemukan.' }

    const [phoneOwner, usernameOwner, district] = await Promise.all([
      db.user.findUnique({ where: { phone }, select: { id: true } }),
      db.athleteProfile.findUnique({ where: { username }, select: { id: true } }),
      db.district.findUnique({ where: { id: districtId }, select: { id: true } }),
    ])
    if (phoneOwner && phoneOwner.id !== athlete.userId) return { error: 'Nomor HP sudah dipakai akun lain.' }
    if (usernameOwner && usernameOwner.id !== id) return { error: 'Username sudah dipakai.' }
    if (!district) return { error: 'Kecamatan tidak valid.' }
    if (!/^[a-z0-9._]{3,30}$/.test(username)) return { error: 'Username 3–30 karakter: huruf kecil, angka, titik, atau garis bawah.' }
    if (clubId && !(await db.club.findUnique({ where: { id: clubId }, select: { id: true } }))) return { error: 'Klub tidak valid.' }

    await db.$transaction([
      db.user.update({ where: { id: athlete.userId }, data: { name, phone } }),
      db.athleteProfile.update({ where: { id }, data: { username, districtId, clubId, gender } }),
    ])
    revalidateAthletePages()
    return { ok: `Data atlet "${name}" diperbarui.` }
  } catch (err) {
    return { error: dbError(err, 'Gagal memperbarui atlet.') }
  }
}

/**
 * Athletes with any match, competition entry or points history are kept (their
 * results feed the ranking and other players' history) — deactivate those instead.
 */
export async function deleteAthleteAction(id: string) {
  await requireAdmin()
  const athlete = await db.athleteProfile.findUnique({
    where: { id },
    select: {
      userId: true,
      _count: { select: { matchParticipations: true, matchesRequested: true, ratingHistory: true, competitions: true, asPartner: true } },
    },
  })
  if (!athlete) throw new Error('Atlet tidak ditemukan.')
  const used = Object.values(athlete._count).some((n) => n > 0)
  if (used) throw new Error('Atlet ini sudah punya pertandingan, riwayat poin, atau pendaftaran kompetisi, sehingga tidak bisa dihapus. Nonaktifkan akunnya saja.')
  // Deleting the user cascades to the athlete profile (and its achievements).
  await db.user.delete({ where: { id: athlete.userId } })
  revalidateAthletePages()
}

function revalidateAthletePages() {
  revalidatePath('/admin/athletes')
  revalidatePath('/players')
  revalidatePath('/ranking')
  revalidatePath('/clubs', 'layout')
  revalidatePublicSite()
}
