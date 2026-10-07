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
