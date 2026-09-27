import type { RatedPlayer, RatingChange, RatingInput, RatingStrategy } from './types'

export interface EloConfig {
  /** Rating swing per match. Higher = ratings move faster. */
  kProvisional: number // players with few matches settle quickly
  kStandard: number
  kElite: number // top players move slower
  provisionalMatches: number
  eliteRating: number
  floor: number
}

export const DEFAULT_ELO_CONFIG: EloConfig = {
  kProvisional: 50,
  kStandard: 40,
  kElite: 30,
  provisionalMatches: 10,
  eliteRating: 2500,
  floor: 0,
}

/** Probability that a side rated `a` beats a side rated `b`. */
export function expectedScore(a: number, b: number): number {
  return 1 / (1 + Math.pow(10, (b - a) / 400))
}

const avg = (players: RatedPlayer[]) =>
  players.reduce((s, p) => s + p.rating, 0) / players.length

export function createEloStrategy(config: EloConfig = DEFAULT_ELO_CONFIG): RatingStrategy {
  const kFor = (p: RatedPlayer) =>
    p.matchesPlayed < config.provisionalMatches
      ? config.kProvisional
      : p.rating >= config.eliteRating
        ? config.kElite
        : config.kStandard

  return {
    name: 'elo-v1',
    calculate({ teamA, teamB, winner }: RatingInput): RatingChange[] {
      if (!teamA.length || !teamB.length) throw new Error('Both teams need at least one player')
      const ratingA = avg(teamA)
      const ratingB = avg(teamB)

      const side = (players: RatedPlayer[], own: number, opp: number, won: boolean) =>
        players.map((p): RatingChange => {
          // Doubles: compare team averages so partners share the same expectation.
          const expected = expectedScore(own, opp)
          const raw = Math.round(kFor(p) * ((won ? 1 : 0) - expected))
          const after = Math.max(config.floor, p.rating + raw)
          return { athleteId: p.id, ratingBefore: p.rating, ratingAfter: after, ratingDelta: after - p.rating }
        })

      return [
        ...side(teamA, ratingA, ratingB, winner === 'A'),
        ...side(teamB, ratingB, ratingA, winner === 'B'),
      ]
    },
  }
}
