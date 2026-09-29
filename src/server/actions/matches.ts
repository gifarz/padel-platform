'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin, requireAthlete } from '@/server/guards'
import { parseScore, flipSets } from '@/lib/score'
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
  return { ok: 'Hasil diverifikasi, rating diperbarui.' }
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
  return { ok: 'Hasil dikoreksi, rating diperbarui ulang.' }
}

/** Admin creates a match directly (e.g. for a competition round) with a referee/court/date already fixed. */
export async function adminCreateMatchAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const teamAIds = String(formData.get('teamA') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const teamBIds = String(formData.get('teamB') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const courtId = String(formData.get('courtId') ?? '') || undefined
  const refereeId = String(formData.get('refereeId') ?? '') || undefined
  const scheduledAt = String(formData.get('scheduledAt') ?? '')

  if (!teamAIds.length || !teamBIds.length) return { error: 'Isi ID atlet untuk kedua tim.' }

  await db.match.create({
    data: {
      format: teamAIds.length > 1 ? 'DOUBLES' : 'SINGLES',
      status: scheduledAt ? 'SCHEDULED' : 'ACCEPTED',
      requestedById: teamAIds[0]!,
      courtId, refereeId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      participants: {
        create: [
          ...teamAIds.map((athleteId) => ({ athleteId, team: 'A' as const, acceptedAt: new Date() })),
          ...teamBIds.map((athleteId) => ({ athleteId, team: 'B' as const, acceptedAt: new Date() })),
        ],
      },
    },
  })
  revalidatePath('/admin/matches')
  return { ok: 'Pertandingan dibuat.' }
}