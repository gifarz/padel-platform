/** Lowercase, hyphenated slug from a display name — e.g. "Garut Padel Club" -> "garut-padel-club". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
