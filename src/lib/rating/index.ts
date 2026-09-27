import { createEloStrategy } from './elo'
import type { RatingStrategy } from './types'

/** The one place that decides which algorithm the app uses. */
export const ratingService: RatingStrategy = createEloStrategy()

export * from './types'
export * from './levels'
export * from './level-match'
export { expectedScore } from './elo'
