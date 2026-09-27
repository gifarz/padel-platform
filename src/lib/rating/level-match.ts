/**
 * "Level Match" %: how close two ratings are. 30 pts apart → 98%.
 * Same formula as the landing page, so numbers stay consistent.
 */
export function levelMatch(myRating: number, theirRating: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - Math.abs(myRating - theirRating) / 14)))
}
