'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin, requireAthlete } from '@/server/guards'
import { revalidatePublicSite } from '@/server/revalidate'
import { parseLocalDateTime } from '@/lib/format'
import type { FormState } from '@/server/form-state'
import { generateBracket, BracketError } from '@/server/services/bracket'

export async function registerForCompetitionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { athleteId } = await requireAthlete()
  const competitionId = String(formData.get('competitionId'))
  const partnerIdRaw = String(formData.get('partnerId') ?? '').trim()
  const partnerId = partnerIdRaw || undefined

  const competition = await db.competition.findUnique({ where: { id: competitionId } })
  if (!competition) return { error: 'Kompetisi tidak ditemukan.' }
  if (competition.status !== 'REGISTRATION_OPEN') return { error: 'Pendaftaran belum atau sudah tidak dibuka.' }

  const already = await db.competitionParticipant.findUnique({ where: { competitionId_athleteId: { competitionId, athleteId } } })
  if (already) return { error: 'Kamu sudah terdaftar di kompetisi ini.' }

  if (competition.minRating || competition.maxRating) {
    const athlete = await db.athleteProfile.findUniqueOrThrow({ where: { id: athleteId } })
    if (competition.minRating && athlete.rating < competition.minRating) return { error: 'Rating kamu di bawah syarat minimum kompetisi ini.' }
    if (competition.maxRating && athlete.rating > competition.maxRating) return { error: 'Rating kamu di atas batas maksimum kompetisi ini.' }
  }

  const confirmedCount = await db.competitionParticipant.count({
    where: { competitionId, status: { in: ['REGISTERED', 'CONFIRMED'] } },
  })
  const status = confirmedCount >= competition.maxPlayers ? 'WAITLIST' : 'REGISTERED'

  await db.competitionParticipant.create({ data: { competitionId, athleteId, partnerId, status } })
  revalidatePath(`/competitions/${competitionId}`)
  return { ok: status === 'WAITLIST' ? 'Kuota penuh. Kamu masuk daftar tunggu.' : 'Berhasil daftar.' }
}

export async function adminRegisterAthleteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const competitionId = String(formData.get('competitionId'))
  const athleteId = String(formData.get('athleteId'))
  const partnerId = String(formData.get('partnerId') ?? '') || undefined
  if (!athleteId) return { error: 'Pilih atlet terlebih dahulu.' }

  await db.competitionParticipant.create({ data: { competitionId, athleteId, partnerId, status: 'REGISTERED', registeredByAdmin: true } })
  revalidatePath(`/admin/competitions/${competitionId}`)
  revalidatePath(`/competitions/${competitionId}`)
  revalidatePath('/competitions')
  return { ok: 'Atlet berhasil didaftarkan.' }
}

export async function updateParticipantStatusAction(participantId: string, status: string, competitionId: string) {
  await requireAdmin()
  await db.competitionParticipant.update({ where: { id: participantId }, data: { status: status as never } })
  revalidatePath(`/admin/competitions/${competitionId}`)
}

export async function removeParticipantAction(participantId: string, competitionId: string) {
  await requireAdmin()
  await db.competitionParticipant.delete({ where: { id: participantId } })
  revalidatePath(`/admin/competitions/${competitionId}`)
}

export async function createCompetitionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const name = String(formData.get('name') ?? '').trim()
  const locationId = String(formData.get('locationId') ?? '')
  const category = formData.get('category') as string
  const maxPlayers = Number(formData.get('maxPlayers') ?? 0)
  const startsAt = parseLocalDateTime(formData.get('startsAt'))
  const endsAt = parseLocalDateTime(formData.get('endsAt'))
  const registrationDeadline = parseLocalDateTime(formData.get('registrationDeadline'))
  const prize = String(formData.get('prize') ?? '') || undefined
  const minRating = formData.get('minRating') ? Number(formData.get('minRating')) : undefined
  const maxRating = formData.get('maxRating') ? Number(formData.get('maxRating')) : undefined

  if (!name || !locationId || !startsAt || !endsAt || !registrationDeadline || !maxPlayers) {
    return { error: 'Lengkapi semua kolom wajib.' }
  }

  const competition = await db.competition.create({
    data: {
      name, locationId, category: category as never, maxPlayers,
      startsAt, endsAt, registrationDeadline, prize, minRating, maxRating,
      status: 'DRAFT',
    },
  })
  revalidatePath('/admin/competitions')
  return { ok: `Kompetisi "${name}" dibuat sebagai draf. ID: ${competition.id}` }
}

export async function generateBracketAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const competitionId = String(formData.get('competitionId'))
  try {
    const { rounds, size } = await generateBracket(db, competitionId)
    revalidatePath(`/admin/competitions/${competitionId}`)
    return { ok: `Bracket dibuat: ${size} slot, ${rounds} babak.` }
  } catch (err) {
    if (err instanceof BracketError) return { error: err.message }
    throw err
  }
}

export async function updateCompetitionStatusAction(competitionId: string, status: string) {
  await requireAdmin()
  await db.competition.update({ where: { id: competitionId }, data: { status: status as never } })
  revalidatePath('/admin/competitions')
  revalidatePath(`/admin/competitions/${competitionId}`)
  // Status is what decides whether a competition shows up on the public site at all.
  revalidatePublicSite()
}
