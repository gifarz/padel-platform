/**
 * Verifying a match is the one moment ratings change. Nothing else should
 * write AthleteProfile.rating except this file (and the explicit admin
 * adjustment action, which logs ADMIN_ADJUSTMENT in RatingHistory).
 *
 * Both functions run under Serializable isolation so two verifications that
 * touch the same athlete can't overwrite each other. If Postgres aborts one
 * with a serialization error (Prisma P2034), the caller can simply retry.
 */
import type { Match, Prisma, PrismaClient } from '@prisma/client'
import { ratingService } from '@/lib/rating'
import type { RatedPlayer } from '@/lib/rating'
import { advanceWinner } from './bracket'

export class MatchVerificationError extends Error {}

const withPlayers = { participants: { include: { athlete: true } } } satisfies Prisma.MatchInclude

async function applyVerification(tx: Prisma.TransactionClient, matchId: string, verifiedById: string): Promise<Match> {
  const match = await tx.match.findUnique({ where: { id: matchId }, include: withPlayers })
  if (!match) throw new MatchVerificationError('Pertandingan tidak ditemukan')
  if (match.status === 'VERIFIED') throw new MatchVerificationError('Pertandingan sudah diverifikasi')
  if (match.status !== 'PENDING_VERIFICATION') throw new MatchVerificationError('Pertandingan belum siap diverifikasi')
  if (!match.winnerTeam) throw new MatchVerificationError('Pemenang belum ditentukan')

  const toPlayer = (p: (typeof match.participants)[number]): RatedPlayer => ({
    id: p.athleteId,
    rating: p.athlete.rating,
    matchesPlayed: p.athlete.matchesPlayed,
  })
  const teamA = match.participants.filter((p) => p.team === 'A').map(toPlayer)
  const teamB = match.participants.filter((p) => p.team === 'B').map(toPlayer)
  if (!teamA.length || !teamB.length) throw new MatchVerificationError('Kedua tim harus punya pemain')

  const changes = ratingService.calculate({ teamA, teamB, winner: match.winnerTeam })

  for (const c of changes) {
    const p = match.participants.find((x) => x.athleteId === c.athleteId)!
    const won = p.team === match.winnerTeam

    await tx.athleteProfile.update({
      where: { id: c.athleteId },
      data: {
        rating: c.ratingAfter,
        peakRating: Math.max(p.athlete.peakRating, c.ratingAfter),
        matchesPlayed: { increment: 1 },
        wins: { increment: won ? 1 : 0 },
        losses: { increment: won ? 0 : 1 },
      },
    })
    await tx.matchParticipant.update({
      where: { id: p.id },
      data: { ratingBefore: c.ratingBefore, ratingAfter: c.ratingAfter, ratingDelta: c.ratingDelta },
    })
    // Append-only: past ratings stay reconstructable.
    await tx.ratingHistory.create({
      data: {
        athleteId: c.athleteId, matchId, reason: 'MATCH',
        ratingBefore: c.ratingBefore, ratingAfter: c.ratingAfter, ratingDelta: c.ratingDelta,
        createdById: verifiedById,
      },
    })
  }

  const verified = await tx.match.update({ where: { id: matchId }, data: { status: 'VERIFIED', verifiedById, verifiedAt: new Date() } })

  // Bracket match: push the winning side (and doubles partner) into the next round.
  if (verified.nextMatchId) {
    const winners = match.participants.filter((p) => p.team === verified.winnerTeam)
    for (const w of winners) {
      // Doubles: advanceWinner dedupes by athleteId, so calling it once per
      // winning participant (rather than trying to guess a "primary" player
      // and a partner) is simplest and still only inserts each athlete once.
      await advanceWinner(tx, matchId, w.athleteId)
    }
  }

  return verified
}

export function verifyMatch(db: PrismaClient, matchId: string, verifiedById: string): Promise<Match> {
  return db.$transaction((tx) => applyVerification(tx, matchId, verifiedById), { isolationLevel: 'Serializable' })
}

/**
 * Corrects the winner of an already-verified match: first undoes the old
 * result (rating, matches played, wins/losses — each logged as a CORRECTION
 * row), then verifies the corrected result the normal way.
 *
 * Known limit: later matches these athletes played are NOT recalculated;
 * they keep the ratings that were current when they were verified.
 */
export function correctMatchResult(
  db: PrismaClient, matchId: string, correctedWinner: 'A' | 'B', correctedById: string, note?: string,
): Promise<Match> {
  return db.$transaction(async (tx) => {
    const match = await tx.match.findUnique({ where: { id: matchId }, include: withPlayers })
    if (!match || match.status !== 'VERIFIED') {
      throw new MatchVerificationError('Hanya pertandingan yang sudah diverifikasi yang bisa dikoreksi')
    }
    if (match.winnerTeam === correctedWinner) throw new MatchVerificationError('Pemenangnya sama dengan hasil sebelumnya')

    for (const p of match.participants) {
      if (p.ratingDelta == null) continue
      const wasWinner = p.team === match.winnerTeam
      await tx.athleteProfile.update({
        where: { id: p.athleteId },
        data: {
          rating: { decrement: p.ratingDelta },
          matchesPlayed: { decrement: 1 },
          wins: { decrement: wasWinner ? 1 : 0 },
          losses: { decrement: wasWinner ? 0 : 1 },
        },
      })
      await tx.ratingHistory.create({
        data: {
          athleteId: p.athleteId, matchId, reason: 'CORRECTION',
          ratingBefore: p.athlete.rating, ratingAfter: p.athlete.rating - p.ratingDelta, ratingDelta: -p.ratingDelta,
          note: note ?? 'Membatalkan hasil sebelumnya (koreksi admin)', createdById: correctedById,
        },
      })
    }

    await tx.match.update({ where: { id: matchId }, data: { winnerTeam: correctedWinner, status: 'PENDING_VERIFICATION' } })
    return applyVerification(tx, matchId, correctedById)
  }, { isolationLevel: 'Serializable' })
}
