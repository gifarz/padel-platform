/**
 * Shared (server + client safe) constants and URL helpers for admin uploads.
 * Files themselves live on disk under UPLOAD_DIR and are served by
 * /api/uploads/[...path] — see src/server/uploads.ts.
 */
export const UPLOAD_FOLDERS = ['news', 'clubs', 'organization'] as const
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number]

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const UPLOAD_URL_PREFIX = '/api/uploads/'

/**
 * Image URLs end up in <Image src>, which throws at render time for hosts
 * that aren't allowlisted (next.config only allows https). Validate at write
 * time so one bad admin entry can't break a public page.
 */
export function sanitizeImageUrl(raw: unknown): string | undefined {
  const v = String(raw ?? '').trim()
  if (!v) return undefined
  if (v.startsWith(UPLOAD_URL_PREFIX) && !v.includes('..')) return v
  try {
    const u = new URL(v)
    if (u.protocol === 'https:') return u.toString()
  } catch {}
  return undefined
}

/**
 * Admin-entered outbound links (club website / Instagram) end up in <a href>.
 * Only http(s) is accepted so a `javascript:` URL can never be stored.
 */
export function sanitizeExternalUrl(raw: unknown): string | undefined {
  const v = String(raw ?? '').trim()
  if (!v) return undefined
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`)
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString()
  } catch {}
  return undefined
}

/** "@garutpadel", "garutpadel" or a full URL → https://instagram.com/garutpadel. */
export function normalizeInstagram(raw: unknown): string | undefined {
  const v = String(raw ?? '').trim()
  if (!v) return undefined
  if (/^https?:\/\//i.test(v) || v.includes('instagram.com')) return sanitizeExternalUrl(v)
  const handle = v.replace(/^@/, '')
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? `https://instagram.com/${handle}` : undefined
}
