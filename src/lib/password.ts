import { randomBytes } from 'node:crypto'

// No 0/O/1/l/I so a temp password read out over the phone isn't ambiguous.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Cryptographically secure temporary password (Math.random is predictable and must not be used for this). */
export function generateTempPassword(length = 10): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i]! % ALPHABET.length]
  return out
}

export const MIN_PASSWORD_LENGTH = 8
