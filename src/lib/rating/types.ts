export type TeamId = 'A' | 'B'

export interface RatedPlayer {
  id: string
  rating: number
  matchesPlayed: number // matches played BEFORE this one
}

export interface RatingInput {
  teamA: RatedPlayer[]
  teamB: RatedPlayer[]
  winner: TeamId
}

export interface RatingChange {
  athleteId: string
  ratingBefore: number
  ratingAfter: number
  ratingDelta: number
}

/** Swap the algorithm by implementing this and changing src/lib/rating/index.ts. */
export interface RatingStrategy {
  readonly name: string
  calculate(input: RatingInput): RatingChange[]
}
