export interface LevelDef {
  name: string
  slug: string
  minRating: number
  maxRating: number | null
  sortOrder: number
}

/** Used for seeding. At runtime pass the rows from the Level table instead. */
export const DEFAULT_LEVELS: LevelDef[] = [
  { name: 'Pemula', slug: 'rookie', minRating: 0, maxRating: 999, sortOrder: 1 },
  { name: 'Penantang', slug: 'challenger', minRating: 1000, maxRating: 1499, sortOrder: 2 },
  { name: 'Kompetitor', slug: 'competitor', minRating: 1500, maxRating: 1999, sortOrder: 3 },
  { name: 'Mahir', slug: 'advanced', minRating: 2000, maxRating: 2499, sortOrder: 4 },
  { name: 'Elite', slug: 'elite', minRating: 2500, maxRating: null, sortOrder: 5 },
]

export function levelForRating(rating: number, levels: LevelDef[] = DEFAULT_LEVELS): LevelDef {
  const sorted = [...levels].sort((a, b) => a.minRating - b.minRating)
  return [...sorted].reverse().find((l) => rating >= l.minRating) ?? sorted[0]
}

/** Points left until the next level, or null at the top. */
export function pointsToNextLevel(rating: number, levels: LevelDef[] = DEFAULT_LEVELS) {
  const sorted = [...levels].sort((a, b) => a.minRating - b.minRating)
  const next = sorted.find((l) => l.minRating > rating)
  return next ? { level: next, points: next.minRating - rating } : null
}
