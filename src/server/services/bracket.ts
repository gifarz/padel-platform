/**
 * Single-elimination bracket generator + auto-advance.
 *
 * Seeding uses the standard "1 vs last, 2 vs second-last…" tournament order,
 * generated recursively so higher seeds only meet in later rounds. Byes (when
 * the participant count isn't a power of two) are resolved as a same-round
 * "bye match": one participant on Team A, nobody on Team B, immediately
 * VERIFIED without touching the rating engine — a bye is a scheduling
 * artifact, not a played result, so it must never call verifyMatch().
 *
 * Every round is materialized as real Match rows (round, bracketSlot,
 * nextMatchId) so the tree is fully visible before anyone's played a game.
 * Round 2+ matches start with empty participants and get filled in by
 * `advanceWinner`, called from the verification service whenever a match
 * with a nextMatchId is verified.
 */
import type { Prisma, PrismaClient } from '@prisma/client'

export class BracketError extends Error {}

const nextPowerOfTwo = (n: number) => Math.pow(2, Math.ceil(Math.log2(Math.max(1, n))))

/** Standard bracket seed order for a given size, e.g. size 8 → [1,8,4,5,2,7,3,6]. */
function seedOrder(size: number): number[] {
  if (size === 1) return [1]
  const prev = seedOrder(size / 2)
  const out: number[] = []
  for (const s of prev) {
    out.push(s, size + 1 - s)
  }
  return out
}

interface SeedSlot {
  athleteId: string
  partnerId: string | null
}

export async function generateBracket(db: PrismaClient, competitionId: string) {
  return db.$transaction(async (tx) => {
    const existing = await tx.match.count({ where: { competitionId, round: { not: null } } })
    if (existing > 0) throw new BracketError('Bracket untuk kompetisi ini sudah dibuat.')

    const participants = await tx.competitionParticipant.findMany({
      where: { competitionId, status: 'CONFIRMED' },
      include: { athlete: { select: { rating: true } } },
      orderBy: { athlete: { rating: 'desc' } },
    })
    if (participants.length < 2) throw new BracketError('Minimal 2 peserta berstatus "Dikonfirmasi" untuk membuat bracket.')

    const size = nextPowerOfTwo(participants.length)
    const order = seedOrder(size)
    const slots: (SeedSlot | null)[] = order.map((seed) => {
      const p = participants[seed - 1]
      return p ? { athleteId: p.athleteId, partnerId: p.partnerId } : null
    })

    const rounds = Math.log2(size)
    const format = participants[0]?.partnerId ? 'DOUBLES' : 'SINGLES'
    // matchIds[round][slotIndex] — slotIndex halves each round.
    const matchIds: string[][] = []

    for (let round = 1; round <= rounds; round++) {
      const count = size / Math.pow(2, round)
      const ids: string[] = []
      for (let slot = 0; slot < count; slot++) {
        const created = await tx.match.create({
          data: {
            competitionId,
            format,
            status: 'REQUESTED',
            round,
            bracketSlot: slot,
            // Administrative placeholder — this is an admin-generated bracket match, not a personal challenge.
            requestedById: participants[0]!.athleteId,
          },
        })
        ids.push(created.id)
      }
      matchIds.push(ids)

      // Now that this round's matches exist, wire the PREVIOUS round's matches
      // forward to them (each pair of previous-round matches feeds one match here).
      if (round > 1) {
        const prevIds = matchIds[round - 2]!
        for (let slot = 0; slot < prevIds.length; slot++) {
          await tx.match.update({ where: { id: prevIds[slot] }, data: { nextMatchId: ids[Math.floor(slot / 2)] } })
        }
      }
    }

    // Populate round 1 with real pairings, resolving byes immediately.
    for (let slot = 0; slot < size / 2; slot++) {
      const a = slots[slot * 2]
      const b = slots[slot * 2 + 1]
      const matchId = matchIds[0]![slot]!

      if (a && b) {
        await tx.matchParticipant.createMany({
          data: [
            { matchId, athleteId: a.athleteId, team: 'A', acceptedAt: new Date() },
            { matchId, athleteId: b.athleteId, team: 'B', acceptedAt: new Date() },
          ],
        })
        await tx.match.update({ where: { id: matchId }, data: { status: 'SCHEDULED' } })
      } else {
        // Bye: whichever side is real gets a walkover, structurally recorded but never rated.
        const real = a ?? b
        if (real) {
          await tx.matchParticipant.create({ data: { matchId, athleteId: real.athleteId, team: 'A', acceptedAt: new Date() } })
          await tx.match.update({ where: { id: matchId }, data: { status: 'VERIFIED', winnerTeam: 'A', verifiedAt: new Date() } })
          await advanceWinner(tx, matchId, real.athleteId, real.partnerId)
        }
        // both null (padding beyond participant count) — match stays empty, harmless.
      }
    }

    return { finalMatchId: matchIds[matchIds.length - 1]![0]!, rounds, size }
  })
}

/** Moves the winner (and doubles partner, if any) into their next-round match. */
export async function advanceWinner(
  tx: Prisma.TransactionClient,
  matchId: string,
  winnerAthleteId: string,
  winnerPartnerId?: string | null,
) {
  const match = await tx.match.findUnique({ where: { id: matchId } })
  if (!match?.nextMatchId) return

  const nextMatch = await tx.match.findUnique({ where: { id: match.nextMatchId }, include: { participants: true } })
  if (!nextMatch) return

  // Round 1 matches feed into a slot pair; lower bracketSlot of the two feeders takes Team A.
  const feeders = await tx.match.findMany({ where: { nextMatchId: nextMatch.id }, orderBy: { bracketSlot: 'asc' } })
  const team = feeders[0]?.id === matchId ? 'A' : 'B'

  const already = nextMatch.participants.some((p) => p.athleteId === winnerAthleteId)
  if (already) return

  await tx.matchParticipant.create({ data: { matchId: nextMatch.id, athleteId: winnerAthleteId, team, acceptedAt: new Date() } })
  if (winnerPartnerId) {
    await tx.matchParticipant.create({ data: { matchId: nextMatch.id, athleteId: winnerPartnerId, team, acceptedAt: new Date() } })
  }

  const filled = await tx.matchParticipant.count({ where: { matchId: nextMatch.id } })
  const bothTeams = await tx.matchParticipant.groupBy({ by: ['team'], where: { matchId: nextMatch.id } })
  if (filled > 0 && bothTeams.length === 2) {
    await tx.match.update({ where: { id: nextMatch.id }, data: { status: 'SCHEDULED' } })
  }
}
