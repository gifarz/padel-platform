'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin, requireAthlete } from '@/server/guards'
import { parseScore, flipSets } from '@/lib/score'
import { parseLocalDateTime } from '@/lib/format'
import { revalidatePublicSite } from '@/server/revalidate'
import type { FormState } from '@/server/form-state'
import { verifyMatch, correctMatchResult, MatchVerificationError } from '../services/match-verification'

/** Athlete A challenges athlete B. Creates a REQUESTED match awaiting acceptance. */
export async function requestMatchAction(opponentAthleteId: string) {
  const { athleteId: meId } = await requireAthlete()
  if (meId === opponentAthleteId) throw new Error('Tidak bisa menantang diri sendiri.')

  const match = await db.match.create({
    data: {
      format: 'SINGLES',
      status: 'REQUESTED',
      requestedById: meId,
      participants: {
        create: [
          { athleteId: meId, team: 'A', acceptedAt: new Date() },
          { athleteId: opponentAthleteId, team: 'B' },
        ],
      },
    },
  })
  revalidatePath('/matches')
  return match.id
}

export async function acceptMatchAction(matchId: string) {
  const { athleteId: meId } = await requireAthlete()
  const participant = await db.matchParticipant.findUnique({ where: { matchId_athleteId: { matchId, athleteId: meId } } })
  if (!participant) throw new Error('Kamu bukan bagian dari pertandingan ini.')

  await db.$transaction([
    db.matchParticipant.update({ where: { id: participant.id }, data: { acceptedAt: new Date() } }),
    db.match.update({ where: { id: matchId }, data: { status: 'ACCEPTED' } }),
  ])
  revalidatePath('/matches')
}

export async function declineMatchAction(matchId: string) {
  const { athleteId: meId } = await requireAthlete()
  const participant = await db.matchParticipant.findUnique({ where: { matchId_athleteId: { matchId, athleteId: meId } } })
  if (!participant) throw new Error('Kamu bukan bagian dari pertandingan ini.')
  await db.match.update({ where: { id: matchId }, data: { status: 'CANCELLED', cancelReason: 'Ditolak oleh lawan' } })
  revalidatePath('/matches')
}

/** Score is entered from the submitting player's own side; we flip it if they're on team B. */
export async function submitResultAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { athleteId: meId, userId } = await requireAthlete()
  const matchId = String(formData.get('matchId'))
  const scoreText = String(formData.get('score') ?? '')

  const participant = await db.matchParticipant.findUnique({ where: { matchId_athleteId: { matchId, athleteId: meId } } })
  if (!participant) return { error: 'Kamu bukan bagian dari pertandingan ini.' }

  const parsed = parseScore(scoreText)
  if ('error' in parsed) return { error: parsed.error }

  // Sets are always stored from Team A's perspective.
  const sets = participant.team === 'A' ? parsed.sets : flipSets(parsed.sets)
  const winnerTeam = participant.team === 'A' ? parsed.winner : parsed.winner === 'A' ? 'B' : 'A'

  await db.match.update({
    where: { id: matchId },
    data: { sets, winnerTeam, status: 'PENDING_VERIFICATION', submittedById: userId, playedAt: new Date() },
  })
  revalidatePath('/matches')
  revalidatePath('/admin/matches')
  return { ok: 'Skor terkirim, menunggu verifikasi.' }
}

/** Admin (or a referee) verifies a result — this is what actually moves ratings. */
export async function verifyMatchAction(matchId: string): Promise<FormState> {
  const { userId } = await requireAdmin()
  try {
    await verifyMatch(db, matchId, userId)
  } catch (err) {
    if (err instanceof MatchVerificationError) return { error: err.message }
    throw err
  }
  revalidatePath('/admin/matches')
  revalidatePath('/ranking')
  revalidatePath('/dashboard')
  // Verified matches change the landing page's match count and ranking preview.
  revalidatePublicSite()
  return { ok: 'Hasil diverifikasi, poin diperbarui.' }
}

export async function correctMatchAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { userId } = await requireAdmin()
  const matchId = String(formData.get('matchId'))
  const winner = formData.get('winner') as 'A' | 'B'
  const note = String(formData.get('note') ?? '') || undefined
  try {
    await correctMatchResult(db, matchId, winner, userId, note)
  } catch (err) {
    if (err instanceof MatchVerificationError) return { error: err.message }
    throw err
  }
  revalidatePath('/admin/matches')
  revalidatePath('/ranking')
  revalidatePublicSite()
  return { ok: 'Hasil dikoreksi, poin diperbarui ulang.' }
}

type AdminTeams = { teamA: string[]; teamB: string[] }

/** Reads the four player selects (a1, a2 / b1, b2) and checks the line-up is sensible. */
function readTeams(formData: FormData): AdminTeams | { error: string } {
  const pick = (k: string) => String(formData.get(k) ?? '').trim()
  const teamA = [pick('a1'), pick('a2')].filter(Boolean)
  const teamB = [pick('b1'), pick('b2')].filter(Boolean)
  if (!teamA.length || !teamB.length) return { error: 'Pilih minimal satu atlet untuk setiap tim.' }
  if (teamA.length !== teamB.length) return { error: 'Jumlah pemain kedua tim harus sama (1 vs 1 atau 2 vs 2).' }
  if (new Set([...teamA, ...teamB]).size !== teamA.length + teamB.length) return { error: 'Satu atlet tidak boleh dipilih dua kali.' }
  return { teamA, teamB }
}

const opt = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim() || null

function revalidateMatches() {
  revalidatePath('/admin/matches')
  revalidatePath('/matches')
  revalidatePublicSite()
}

/** Admin creates a match directly (e.g. for a competition round) with a referee/court/date already fixed. */
export async function adminCreateMatchAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const teams = readTeams(formData)
  if ('error' in teams) return { error: teams.error }

  const scheduledAt = parseLocalDateTime(formData.get('scheduledAt'))
  await db.match.create({
    data: {
      format: teams.teamA.length > 1 ? 'DOUBLES' : 'SINGLES',
      status: scheduledAt ? 'SCHEDULED' : 'ACCEPTED',
      requestedById: teams.teamA[0]!,
      courtId: opt(formData, 'courtId'),
      refereeId: opt(formData, 'refereeId'),
      trainerId: opt(formData, 'trainerId'),
      scheduledAt,
      participants: {
        create: [
          ...teams.teamA.map((athleteId) => ({ athleteId, team: 'A' as const, acceptedAt: new Date() })),
          ...teams.teamB.map((athleteId) => ({ athleteId, team: 'B' as const, acceptedAt: new Date() })),
        ],
      },
    },
  })
  revalidateMatches()
  return { ok: 'Pertandingan dibuat.' }
}

const EDITABLE_STATUSES = ['REQUESTED', 'ACCEPTED', 'SCHEDULED', 'PLAYED', 'CANCELLED'] as const
type EditableStatus = (typeof EDITABLE_STATUSES)[number]

/**
 * Admin edit. Once a result has been submitted (PENDING_VERIFICATION) or
 * verified, the line-up, status and score are locked — those feed points —
 * and only schedule / court / referee / trainer can change. A verified result
 * is fixed through "Koreksi", not here.
 */
export async function updateMatchAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { userId } = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const match = await db.match.findUnique({ where: { id }, select: { status: true } })
  if (!match) return { error: 'Pertandingan tidak ditemukan.' }

  const base = {
    scheduledAt: parseLocalDateTime(formData.get('scheduledAt')),
    courtId: opt(formData, 'courtId'),
    refereeId: opt(formData, 'refereeId'),
    trainerId: opt(formData, 'trainerId'),
  }

  const resultLocked = match.status === 'PENDING_VERIFICATION' || match.status === 'VERIFIED'
  if (resultLocked) {
    await db.match.update({ where: { id }, data: base })
    revalidateMatches()
    return { ok: 'Jadwal, lapangan, wasit, dan pelatih diperbarui.' }
  }

  const teams = readTeams(formData)
  if ('error' in teams) return { error: teams.error }

  const statusRaw = String(formData.get('status') ?? match.status)
  const status: EditableStatus = (EDITABLE_STATUSES as readonly string[]).includes(statusRaw) ? (statusRaw as EditableStatus) : (match.status as EditableStatus)

  const scoreText = String(formData.get('score') ?? '').trim()
  let result: { sets: number[][]; winnerTeam: 'A' | 'B' } | null = null
  if (scoreText) {
    if (status === 'CANCELLED') return { error: 'Pertandingan yang dibatalkan tidak bisa diberi skor.' }
    const parsed = parseScore(scoreText)
    if ('error' in parsed) return { error: parsed.error }
    result = { sets: parsed.sets, winnerTeam: parsed.winner }
  }

  await db.$transaction(async (tx) => {
    await tx.matchParticipant.deleteMany({ where: { matchId: id } })
    await tx.match.update({
      where: { id },
      data: {
        ...base,
        format: teams.teamA.length > 1 ? 'DOUBLES' : 'SINGLES',
        requestedById: teams.teamA[0]!,
        status: result ? 'PENDING_VERIFICATION' : status,
        cancelReason: status === 'CANCELLED' ? opt(formData, 'cancelReason') ?? 'Dibatalkan admin' : null,
        ...(result ? { sets: result.sets, winnerTeam: result.winnerTeam, submittedById: userId, playedAt: new Date() } : {}),
        participants: {
          create: [
            ...teams.teamA.map((athleteId) => ({ athleteId, team: 'A' as const, acceptedAt: new Date() })),
            ...teams.teamB.map((athleteId) => ({ athleteId, team: 'B' as const, acceptedAt: new Date() })),
          ],
        },
      },
    })
  })
  revalidateMatches()
  return { ok: result ? 'Pertandingan diperbarui, skor masuk antrean verifikasi.' : 'Pertandingan diperbarui.' }
}

/** Verified matches already moved points, and bracket matches belong to their competition — neither can be deleted here. */
export async function deleteMatchAction(id: string) {
  await requireAdmin()
  const match = await db.match.findUnique({ where: { id }, select: { status: true, competitionId: true, round: true } })
  if (!match) throw new Error('Pertandingan tidak ditemukan.')
  if (match.status === 'VERIFIED') throw new Error('Pertandingan yang sudah diverifikasi sudah mengubah poin atlet dan tidak bisa dihapus. Gunakan "Koreksi" bila hasilnya keliru.')
  if (match.competitionId && match.round != null) throw new Error('Ini pertandingan bagan kompetisi. Ubah lewat halaman kompetisi, bukan dihapus.')
  await db.match.delete({ where: { id } })
  revalidateMatches()
}
