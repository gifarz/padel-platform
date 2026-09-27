/**
 * Indonesian phone number handling for the app's phone-first login identity.
 * Every phone number is stored in the database as +62XXXXXXXXXX — normalize
 * on the way in, never store raw user input.
 */

/**
 * Accepts common Indonesian input shapes and returns the canonical
 * +62XXXXXXXXXX form, or null if the input isn't a plausible Indonesian
 * mobile number.
 *
 * Accepted inputs (whitespace/dashes/dots are stripped first):
 *   081234567890
 *   81234567890
 *   +6281234567890
 *   6281234567890
 *   62 812-3456-7890
 */
export function normalizeIndonesianPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s.\-()]/g, '')
  if (!/^(\+?62|0)?8\d{7,12}$/.test(cleaned)) return null

  let digits = cleaned
  if (digits.startsWith('+62')) digits = digits.slice(3)
  else if (digits.startsWith('62')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = digits.slice(1)

  if (!/^8\d{7,12}$/.test(digits)) return null

  return `+62${digits}`
}

/** True if the input normalizes to a valid Indonesian mobile number. */
export function isValidIndonesianPhone(raw: string): boolean {
  return normalizeIndonesianPhone(raw) !== null
}

/** Formats a stored +62XXXXXXXXXX number for display, e.g. "+62 812-3456-7890". */
export function formatIndonesianPhone(stored: string): string {
  const match = /^\+62(\d{3,4})(\d{4})(\d{2,4})$/.exec(stored)
  if (!match) return stored
  return `+62 ${match[1]}-${match[2]}-${match[3]}`
}
