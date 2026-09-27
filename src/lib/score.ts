export type ParsedScore = { sets: number[][]; winner: 'A' | 'B' } | { error: string }

/** "6-4, 3-6, 6-2" → sets + winner. Scores are written from the first team's point of view. */
export function parseScore(text: string): ParsedScore {
  const parts = text.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0 || parts.length > 5) return { error: 'Isi skor 1–5 set, contoh: 6-4, 3-6, 6-2' }
  const sets: number[][] = []
  for (const p of parts) {
    const m = p.match(/^(\d{1,2})\s*[-:]\s*(\d{1,2})$/)
    if (!m) return { error: `Format skor "${p}" salah. Contoh: 6-4` }
    sets.push([Number(m[1]), Number(m[2])])
  }
  const a = sets.filter((s) => s[0]! > s[1]!).length
  const b = sets.filter((s) => s[1]! > s[0]!).length
  if (a === b) return { error: 'Skor seri, pemenang tidak bisa ditentukan.' }
  return { sets, winner: a > b ? 'A' : 'B' }
}

export const flipSets = (sets: number[][]) => sets.map(([a, b]) => [b!, a!])
