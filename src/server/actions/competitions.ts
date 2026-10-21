'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { requireAdmin, requireAthlete } from '@/server/guards'
import { revalidatePublicSite } from '@/server/revalidate'
import { parseLocalDateTime } from '@/lib/format'
import {
  CATEGORY_KEYS, COMPETITION_STATUSES, STATUS_TRANSITIONS, COMPETITION_STATUS_LABEL,
  genderRuleError, isDoublesCategory, isRegistrationOpen, type CompetitionStatusKey,
} from '@/lib/competition'
import type { FormState } from '@/server/form-state'
import { generateBracket, BracketError } from '@/server/services/bracket'

const PARTICIPANT_STATUSES = ['REGISTERED', 'CONFIRMED', 'WAITLIST', 'ELIMINATED', 'WINNER'] as const
type ParticipantStatusKey = (typeof PARTICIPANT_STATUSES)[number]
const ACTIVE_SEATS: ParticipantStatusKey[] = ['REGISTERED', 'CONFIRMED']

function revalidateCompetition(id?: string) {
  revalidatePath('/admin/competitions')
  if (id) revalidatePath(`/admin/competitions/${id}`)
  revalidatePath('/competitions')
  if (id) revalidatePath(`/competitions/${id}`)
  // Status decides whether a competition shows up on the public site at all.
  revalidatePublicSite()
}

/** Prisma errors carry internals; give forms a short message instead. */
function friendly(err: unknown, fallback: string) {
  if (typeof err === 'object' && err && 'code' in err) {
    const code = (err as { code?: string }).code
    if (code === 'P2002') return 'Data ini sudah ada.'
    if (code === 'P2003') return 'Data terkait tidak ditemukan.'
    if (code === 'P2034') return 'Server sedang sibuk, coba lagi sebentar.'
  }
  return fallback
}

/** Moves the oldest WAITLIST entries into open seats. Call after anything that frees a seat. */
async function promoteWaitlist(tx: Prisma.TransactionClient, competitionId: string) {
  const comp = await tx.competition.findUnique({ where: { id: competitionId }, select: { maxPlayers: true, status: true } })
  if (!comp || (comp.status !== 'REGISTRATION_OPEN' && comp.status !== 'REGISTRATION_CLOSED')) return
  const taken = await tx.competitionParticipant.count({ where: { competitionId, status: { in: ACTIVE_SEATS } } })
  const free = comp.maxPlayers - taken
  if (free <= 0) return
  const next = await tx.competitionParticipant.findMany({ where: { competitionId, status: 'WAITLIST' }, orderBy: { registeredAt: 'asc' }, take: free, select: { id: true } })
  if (next.length) await tx.competitionParticipant.updateMany({ where: { id: { in: next.map((n) => n.id) } }, data: { status: 'REGISTERED' } })
}

// ───────── athlete self-registration ─────────

export async function registerForCompetitionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { athleteId } = await requireAthlete()
  const competitionId = String(formData.get('competitionId') ?? '')
  const partnerUsername = String(formData.get('partnerUsername') ?? '').trim().replace(/^@/, '').toLowerCase()

  try {
    return await db.$transaction(async (tx): Promise<FormState> => {
      const competition = await tx.competition.findUnique({ where: { id: competitionId } })
      if (!competition || competition.status === 'DRAFT') return { error: 'Kompetisi tidak ditemukan.' }
      if (!isRegistrationOpen(competition)) {
        return { error: competition.status === 'REGISTRATION_OPEN' ? 'Batas pendaftaran sudah lewat.' : 'Pendaftaran belum atau sudah tidak dibuka.' }
      }

      const me = await tx.athleteProfile.findUnique({ where: { id: athleteId }, include: { user: { select: { isActive: true } } } })
      if (!me || !me.user.isActive) return { error: 'Akunmu tidak aktif.' }

      const already = await tx.competitionParticipant.findFirst({
        where: { competitionId, OR: [{ athleteId }, { partnerId: athleteId }] },
      })
      if (already) return { error: 'Kamu sudah terdaftar di kompetisi ini.' }

      // ── partner ──
      const doubles = isDoublesCategory(competition.category)
      let partnerId: string | undefined
      let partnerGender: string | null = null
      if (partnerUsername) {
        if (competition.category.endsWith('SINGLES')) return { error: 'Kategori tunggal tidak memakai pasangan.' }
        const partner = await tx.athleteProfile.findUnique({ where: { username: partnerUsername }, include: { user: { select: { isActive: true } } } })
        if (!partner || !partner.user.isActive) return { error: `Pemain dengan username "${partnerUsername}" tidak ditemukan.` }
        if (partner.id === athleteId) return { error: 'Pasangan tidak boleh dirimu sendiri.' }
        const partnerTaken = await tx.competitionParticipant.findFirst({ where: { competitionId, OR: [{ athleteId: partner.id }, { partnerId: partner.id }] } })
        if (partnerTaken) return { error: 'Pasangan yang kamu pilih sudah terdaftar di kompetisi ini.' }
        if (competition.minRating && partner.rating < competition.minRating) return { error: 'Poin pasanganmu di bawah syarat minimum kompetisi ini.' }
        if (competition.maxRating && partner.rating > competition.maxRating) return { error: 'Poin pasanganmu di atas batas maksimum kompetisi ini.' }
        partnerId = partner.id
        partnerGender = partner.gender
      } else if (doubles) {
        return { error: 'Kategori ganda wajib mengisi username pasangan.' }
      }

      const genderError = genderRuleError(competition.category, me.gender, partnerGender)
      if (genderError) return { error: genderError }

      if (competition.minRating && me.rating < competition.minRating) return { error: 'Poin kamu di bawah syarat minimum kompetisi ini.' }
      if (competition.maxRating && me.rating > competition.maxRating) return { error: 'Poin kamu di atas batas maksimum kompetisi ini.' }

      const seats = await tx.competitionParticipant.count({ where: { competitionId, status: { in: ACTIVE_SEATS } } })
      const status: ParticipantStatusKey = seats >= competition.maxPlayers ? 'WAITLIST' : 'REGISTERED'
      await tx.competitionParticipant.create({ data: { competitionId, athleteId, partnerId, status } })
      return { ok: status === 'WAITLIST' ? 'Kuota penuh. Kamu masuk daftar tunggu.' : 'Berhasil daftar. Admin akan mengonfirmasi pendaftaranmu.' }
    }, { isolationLevel: 'Serializable' }).then((r) => {
      revalidateCompetition(competitionId)
      return r
    })
  } catch (err) {
    return { error: friendly(err, 'Gagal mendaftar. Coba lagi.') }
  }
}

/** Athletes can pull their own entry out while registration is still running. */
export async function withdrawFromCompetitionAction(competitionId: string) {
  const { athleteId } = await requireAthlete()
  const competition = await db.competition.findUnique({ where: { id: competitionId }, select: { status: true } })
  if (!competition) throw new Error('Kompetisi tidak ditemukan.')
  if (competition.status !== 'REGISTRATION_OPEN' && competition.status !== 'REGISTRATION_CLOSED') {
    throw new Error('Pendaftaran tidak bisa dibatalkan setelah kompetisi berjalan. Hubungi admin.')
  }
  await db.$transaction(async (tx) => {
    const entry = await tx.competitionParticipant.findFirst({ where: { competitionId, athleteId } })
    if (!entry) throw new Error('Kamu tidak terdaftar di kompetisi ini.')
    await tx.competitionParticipant.delete({ where: { id: entry.id } })
    await promoteWaitlist(tx, competitionId)
  })
  revalidateCompetition(competitionId)
}

// ───────── admin: participants ─────────

export async function adminRegisterAthleteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const competitionId = String(formData.get('competitionId') ?? '')
  const athleteId = String(formData.get('athleteId') ?? '')
  const partnerId = String(formData.get('partnerId') ?? '') || undefined
  if (!athleteId) return { error: 'Pilih atlet terlebih dahulu.' }
  if (partnerId === athleteId) return { error: 'Pasangan tidak boleh atlet yang sama.' }

  try {
    const competition = await db.competition.findUnique({ where: { id: competitionId } })
    if (!competition) return { error: 'Kompetisi tidak ditemukan.' }
    if (competition.status === 'COMPLETED' || competition.status === 'CANCELLED') return { error: 'Kompetisi sudah selesai/dibatalkan.' }
    const ids = [athleteId, ...(partnerId ? [partnerId] : [])]
    const clash = await db.competitionParticipant.findFirst({ where: { competitionId, OR: [{ athleteId: { in: ids } }, { partnerId: { in: ids } }] } })
    if (clash) return { error: 'Atlet atau pasangannya sudah terdaftar di kompetisi ini.' }
    const seats = await db.competitionParticipant.count({ where: { competitionId, status: { in: ACTIVE_SEATS } } })
    const status: ParticipantStatusKey = seats >= competition.maxPlayers ? 'WAITLIST' : 'REGISTERED'
    await db.competitionParticipant.create({ data: { competitionId, athleteId, partnerId, status, registeredByAdmin: true } })
    revalidateCompetition(competitionId)
    return { ok: status === 'WAITLIST' ? 'Kuota penuh, atlet masuk daftar tunggu.' : 'Atlet berhasil didaftarkan.' }
  } catch (err) {
    return { error: friendly(err, 'Gagal mendaftarkan atlet.') }
  }
}

export async function updateParticipantStatusAction(participantId: string, status: string, competitionId: string) {
  await requireAdmin()
  if (!(PARTICIPANT_STATUSES as readonly string[]).includes(status)) throw new Error('Status peserta tidak valid.')
  const hasBracket = await db.match.count({ where: { competitionId, round: { not: null } } })
  if (hasBracket && (status === 'REGISTERED' || status === 'WAITLIST')) {
    throw new Error('Bracket sudah dibuat, status peserta ini tidak bisa diubah ke Terdaftar/Daftar tunggu.')
  }
  await db.$transaction(async (tx) => {
    await tx.competitionParticipant.update({ where: { id: participantId }, data: { status: status as ParticipantStatusKey } })
    await promoteWaitlist(tx, competitionId)
  })
  revalidateCompetition(competitionId)
}

export async function removeParticipantAction(participantId: string, competitionId: string) {
  await requireAdmin()
  const hasBracket = await db.match.count({ where: { competitionId, round: { not: null } } })
  if (hasBracket) throw new Error('Bracket sudah dibuat, peserta tidak bisa dikeluarkan. Batalkan kompetisi atau buat ulang bracket.')
  await db.$transaction(async (tx) => {
    await tx.competitionParticipant.delete({ where: { id: participantId } })
    await promoteWaitlist(tx, competitionId)
  })
  revalidateCompetition(competitionId)
}

// ───────── admin: competition CRUD ─────────

const competitionSchema = z.object({
  name: z.string().trim().min(3, 'Nama kompetisi minimal 3 karakter.').max(120, 'Nama kompetisi maksimal 120 karakter.'),
  description: z.string().trim().max(2000).optional(),
  locationId: z.string().min(1, 'Pilih lokasi.'),
  category: z.enum(CATEGORY_KEYS, { errorMap: () => ({ message: 'Kategori tidak valid.' }) }),
  maxPlayers: z.number({ invalid_type_error: 'Maks. peserta harus angka.' }).int('Maks. peserta harus bilangan bulat.').min(2, 'Minimal 2 peserta.').max(256, 'Maksimal 256 peserta.'),
  prize: z.string().trim().max(120).optional(),
  minRating: z.number().int().min(0).max(10000).optional(),
  maxRating: z.number().int().min(0).max(10000).optional(),
})

function readCompetitionForm(formData: FormData) {
  const optText = (k: string) => String(formData.get(k) ?? '').trim() || undefined
  const optNum = (k: string) => {
    const v = String(formData.get(k) ?? '').trim()
    return v === '' ? undefined : Number(v)
  }
  const parsed = competitionSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    description: optText('description'),
    locationId: String(formData.get('locationId') ?? ''),
    category: String(formData.get('category') ?? ''),
    maxPlayers: Number(String(formData.get('maxPlayers') ?? '')),
    prize: optText('prize'),
    minRating: optNum('minRating'),
    maxRating: optNum('maxRating'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const startsAt = parseLocalDateTime(formData.get('startsAt'))
  const endsAt = parseLocalDateTime(formData.get('endsAt'))
  const registrationDeadline = parseLocalDateTime(formData.get('registrationDeadline'))
  if (!startsAt || !endsAt || !registrationDeadline) return { error: 'Lengkapi tanggal mulai, selesai, dan batas pendaftaran.' }
  if (endsAt < startsAt) return { error: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' }
  if (registrationDeadline > startsAt) return { error: 'Batas pendaftaran harus sebelum (atau sama dengan) waktu mulai.' }
  const { minRating, maxRating } = parsed.data
  if (minRating != null && maxRating != null && minRating > maxRating) return { error: 'Poin minimum tidak boleh lebih besar dari poin maksimum.' }

  return { data: { ...parsed.data, startsAt, endsAt, registrationDeadline } }
}

export async function createCompetitionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const parsed = readCompetitionForm(formData)
  if ('error' in parsed) return { error: parsed.error }
  try {
    const location = await db.location.findUnique({ where: { id: parsed.data.locationId }, select: { id: true } })
    if (!location) return { error: 'Lokasi tidak ditemukan.' }
    const competition = await db.competition.create({ data: { ...parsed.data, status: 'DRAFT' } })
    revalidateCompetition(competition.id)
    return { ok: `Kompetisi "${competition.name}" dibuat sebagai draf. Buka halaman "Kelola" untuk membuka pendaftaran.` }
  } catch (err) {
    return { error: friendly(err, 'Gagal membuat kompetisi.') }
  }
}

export async function updateCompetitionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const existing = await db.competition.findUnique({ where: { id }, select: { status: true, category: true, _count: { select: { participants: true } } } })
  if (!existing) return { error: 'Kompetisi tidak ditemukan.' }
  if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') return { error: 'Kompetisi yang sudah selesai/dibatalkan tidak bisa diubah.' }

  const parsed = readCompetitionForm(formData)
  if ('error' in parsed) return { error: parsed.error }
  const hasBracket = await db.match.count({ where: { competitionId: id, round: { not: null } } })
  if (parsed.data.category !== existing.category && (existing._count.participants > 0 || hasBracket)) {
    return { error: 'Kategori tidak bisa diubah setelah ada peserta.' }
  }
  if (hasBracket && parsed.data.maxPlayers < existing._count.participants) return { error: 'Maks. peserta tidak boleh di bawah jumlah peserta saat ini.' }

  try {
    await db.competition.update({ where: { id }, data: parsed.data })
    revalidateCompetition(id)
    return { ok: 'Kompetisi diperbarui.' }
  } catch (err) {
    return { error: friendly(err, 'Gagal memperbarui kompetisi.') }
  }
}

/** Only drafts / cancelled competitions without any bracket matches can go; everything else has history attached. */
export async function deleteCompetitionAction(id: string) {
  await requireAdmin()
  const c = await db.competition.findUnique({ where: { id }, select: { status: true } })
  if (!c) throw new Error('Kompetisi tidak ditemukan.')
  if (c.status !== 'DRAFT' && c.status !== 'CANCELLED') throw new Error('Hanya kompetisi berstatus Draf atau Dibatalkan yang bisa dihapus.')
  const matches = await db.match.count({ where: { competitionId: id } })
  if (matches > 0) throw new Error('Kompetisi ini sudah punya pertandingan, sehingga tidak bisa dihapus.')
  await db.$transaction([
    db.achievement.deleteMany({ where: { competitionId: id } }),
    db.competition.delete({ where: { id } }), // participants cascade
  ])
  revalidateCompetition()
}

export async function generateBracketAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const competitionId = String(formData.get('competitionId') ?? '')
  try {
    const { rounds, size } = await generateBracket(db, competitionId)
    revalidateCompetition(competitionId)
    revalidatePath('/admin/matches')
    return { ok: `Bracket dibuat: ${size} slot, ${rounds} babak. Status kompetisi kini "Berlangsung".` }
  } catch (err) {
    if (err instanceof BracketError) return { error: err.message }
    return { error: friendly(err, 'Gagal membuat bracket.') }
  }
}

/** The status flow lives in STATUS_TRANSITIONS (src/lib/competition.ts) — this is its server-side enforcement. */
export async function updateCompetitionStatusAction(competitionId: string, status: string): Promise<FormState> {
  await requireAdmin()
  if (!(COMPETITION_STATUSES as string[]).includes(status)) return { error: 'Status tidak valid.' }
  const next = status as CompetitionStatusKey

  const c = await db.competition.findUnique({ where: { id: competitionId }, select: { status: true, registrationDeadline: true, startsAt: true } })
  if (!c) return { error: 'Kompetisi tidak ditemukan.' }
  const current = c.status as CompetitionStatusKey
  if (current === next) return { ok: 'Status tidak berubah.' }
  if (!STATUS_TRANSITIONS[current].includes(next)) {
    return { error: `Status tidak bisa langsung dari "${COMPETITION_STATUS_LABEL[current]}" ke "${COMPETITION_STATUS_LABEL[next]}".` }
  }
  if (next === 'REGISTRATION_OPEN' && c.registrationDeadline < new Date()) {
    return { error: 'Batas pendaftaran sudah lewat. Ubah batas pendaftaran dulu lewat form "Ubah kompetisi".' }
  }
  if (next === 'ONGOING') {
    const bracket = await db.match.count({ where: { competitionId, round: { not: null } } })
    if (!bracket) return { error: 'Buat bracket dulu — status "Berlangsung" otomatis aktif setelah bracket dibuat.' }
  }
  if (next === 'COMPLETED') {
    const open = await db.match.count({ where: { competitionId, round: { not: null }, status: { notIn: ['VERIFIED', 'CANCELLED'] } } })
    if (open > 0) return { error: `Masih ada ${open} pertandingan bracket yang belum diverifikasi.` }
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.competition.update({ where: { id: competitionId }, data: { status: next } })
      // Re-opening registration frees seats for anyone parked on the waitlist.
      if (next === 'REGISTRATION_OPEN') await promoteWaitlist(tx, competitionId)
    })
    revalidateCompetition(competitionId)
    return { ok: `Status diubah ke "${COMPETITION_STATUS_LABEL[next]}".` }
  } catch (err) {
    return { error: friendly(err, 'Gagal mengubah status.') }
  }
}
