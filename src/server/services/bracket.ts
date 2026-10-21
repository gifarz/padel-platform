/**
 * Single-elimination bracket generator + auto-advance.
 *
 * Seeding uses the standard "1 vs last, 2 vs second-last…" tournament order,
 * generated recursively so higher seeds only meet in later rounds. Byes (when
 * the participant count isn't a power of two) are resolved as a same-round
 * "bye match": one side only, immediately VERIFIED without touching the rating
 * engine — a bye is a scheduling artifact, not a played result.
 *
 * Every round is materialized as real Match rows (round, bracketSlot,
 * nextMatchId) so the tree is fully visible before anyone's played a game.
 * Round 2+ matches start empty and get filled in by `advanceWinner`, called
 * from the verification service whenever a match with a nextMatchId is verified.
 *
 * Doubles: each CompetitionParticipant is a PAIR (athleteId + partnerId). Both
 * players are inserted as MatchParticipants on the same team.
 */
import type { Prisma, PrismaClient } from '@prisma/client'
import { isDoublesCategory } from '@/lib/competition'

export class BracketError extends Error {}

const nextPowerOfTwo = (n: number) => Math.pow(2, Math.ceil(Math.log2(Math.max(1, n))))

/** Standard bracket seed order for a given size, e.g. size 8 → [1,8,4,5,2,7,3,6]. */
function seedOrder(size: number): number[] {
  if (size === 1) return [1]
  const prev = seedOrder(size / 2)
  const out: number[] = []
  for (const s of prev) out.push(s, size + 1 - s)
  return out
}

interface SeedSlot {
  athleteId: string
  partnerId: string | null
}

export async function generateBracket(db: PrismaClient, competitionId: string) {
  return db.$transaction(async (tx) => {
    const competition = await tx.competition.findUnique({ where: { id: competitionId } })
    if (!competition) throw new BracketError('Kompetisi tidak ditemukan.')
    if (competition.status !== 'REGISTRATION_CLOSED' && competition.status !== 'ONGOING') {
      throw new BracketError('Tutup pendaftaran dulu (status "Pendaftaran ditutup") sebelum membuat bracket.')
    }

    const existing = await tx.match.count({ where: { competitionId, round: { not: null } } })
    if (existing > 0) throw new BracketError('Bracket untuk kompetisi ini sudah dibuat.')

    const doubles = isDoublesCategory(competition.category)
    const raw = await tx.competitionParticipant.findMany({
      where: { competitionId, status: 'CONFIRMED' },
      include: { athlete: { select: { rating: true } }, partner: { select: { rating: true } } },
    })
    if (raw.length < 2) throw new BracketError('Minimal 2 peserta berstatus "Dikonfirmasi" untuk membuat bracket.')
    if (doubles) {
      const missing = raw.filter((p) => !p.partnerId).length
      if (missing > 0) throw new BracketError(`${missing} peserta belum punya pasangan. Kategori ganda butuh pasangan untuk setiap peserta.`)
    }

    // Seed by strength (a pair = average of both players), earliest registration breaks ties.
    const strength = (p: (typeof raw)[number]) => (p.partner ? (p.athlete.rating + p.partner.rating) / 2 : p.athlete.rating)
    const participants = [...raw].sort((a, b) => strength(b) - strength(a) || a.registeredAt.getTime() - b.registeredAt.getTime())
    await Promise.all(participants.map((p, i) => tx.competitionParticipant.update({ where: { id: p.id }, data: { seed: i + 1 } })))

    const size = nextPowerOfTwo(participants.length)
    const order = seedOrder(size)
    const slots: (SeedSlot | null)[] = order.map((seed) => {
      const p = participants[seed - 1]
      return p ? { athleteId: p.athleteId, partnerId: p.partnerId } : null
    })

    const rounds = Math.log2(size)
    const format = doubles ? 'DOUBLES' : 'SINGLES'
    const matchIds: string[][] = []

    for (let round = 1; round <= rounds; round++) {
      const count = size / Math.pow(2, round)
      const ids: string[] = []
      for (let slot = 0; slot < count; slot++) {
        const created = await tx.match.create({
          data: {
            competitionId, format, status: 'REQUESTED', round, bracketSlot: slot,
            courtId: competition.courtId,
            // Administrative placeholder — an admin-generated bracket match, not a personal challenge.
            requestedById: participants[0]!.athleteId,
          },
        })
        ids.push(created.id)
      }
      matchIds.push(ids)

      // Wire the PREVIOUS round forward to this one (each pair of feeders → one match here).
      if (round > 1) {
        const prevIds = matchIds[round - 2]!
        for (let slot = 0; slot < prevIds.length; slot++) {
          await tx.match.update({ where: { id: prevIds[slot] }, data: { nextMatchId: ids[Math.floor(slot / 2)] } })
        }
      }
    }

    const teamRows = (matchId: string, s: SeedSlot, team: 'A' | 'B') => [
      { matchId, athleteId: s.athleteId, team, acceptedAt: new Date() },
      ...(s.partnerId ? [{ matchId, athleteId: s.partnerId, team, acceptedAt: new Date() }] : []),
    ]

    // Round 1: real pairings, byes resolved immediately.
    for (let slot = 0; slot < size / 2; slot++) {
      const a = slots[slot * 2]
      const b = slots[slot * 2 + 1]
      const matchId = matchIds[0]![slot]!

      if (a && b) {
        await tx.matchParticipant.createMany({ data: [...teamRows(matchId, a, 'A'), ...teamRows(matchId, b, 'B')] })
        await tx.match.update({ where: { id: matchId }, data: { status: 'SCHEDULED' } })
      } else {
        const real = a ?? b
        if (real) {
          await tx.matchParticipant.createMany({ data: teamRows(matchId, real, 'A') })
          await tx.match.update({ where: { id: matchId }, data: { status: 'VERIFIED', winnerTeam: 'A', verifiedAt: new Date() } })
          await advanceWinner(tx, matchId, real.athleteId, real.partnerId)
        }
      }
    }

    // Bracket exists → the competition is now running.
    await tx.competition.update({ where: { id: competitionId }, data: { status: 'ONGOING' } })

    return { finalMatchId: matchIds[matchIds.length - 1]![0]!, rounds, size }
  })
}

/** Which team slot (A/B) a feeder match fills in its next-round match. */
async function teamForFeeder(tx: Prisma.TransactionClient, matchId: string, nextMatchId: string) {
  const feeders = await tx.match.findMany({ where: { nextMatchId }, orderBy: { bracketSlot: 'asc' }, select: { id: true } })
  return feeders[0]?.id === matchId ? ('A' as const) : ('B' as const)
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

  const team = await teamForFeeder(tx, matchId, nextMatch.id)
  const present = new Set(nextMatch.participants.map((p) => p.athleteId))

  const toAdd = [winnerAthleteId, winnerPartnerId].filter((id): id is string => !!id && !present.has(id))
  if (toAdd.length === 0) return
  await tx.matchParticipant.createMany({ data: toAdd.map((athleteId) => ({ matchId: nextMatch.id, athleteId, team, acceptedAt: new Date() })) })

  const teams = await tx.matchParticipant.groupBy({ by: ['team'], where: { matchId: nextMatch.id } })
  if (teams.length === 2 && nextMatch.status === 'REQUESTED') {
    await tx.match.update({ where: { id: nextMatch.id }, data: { status: 'SCHEDULED' } })
  }
}

/**
 * Undo of advanceWinner, used when an admin corrects a bracket result. Refuses
 * if the next-round match has already produced a result, because silently
 * rewriting history past that point would corrupt ratings.
 */
export async function retractWinners(tx: Prisma.TransactionClient, matchId: string, athleteIds: string[]) {
  const match = await tx.match.findUnique({ where: { id: matchId } })
  if (!match?.nextMatchId) return
  const next = await tx.match.findUnique({ where: { id: match.nextMatchId } })
  if (!next) return
  if (next.status === 'PENDING_VERIFICATION' || next.status === 'VERIFIED' || next.status === 'PLAYED') {
    throw new BracketError('Babak berikutnya sudah dimainkan. Koreksi pertandingan babak berikutnya dulu, atau buat ulang bracket.')
  }
  await tx.matchParticipant.deleteMany({ where: { matchId: next.id, athleteId: { in: athleteIds } } })
  await tx.match.update({ where: { id: next.id }, data: { status: 'REQUESTED' } })
}
