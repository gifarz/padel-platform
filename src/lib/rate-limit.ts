/**
 * Tiny in-memory sliding-window limiter, used to slow down password guessing
 * on the login form. It lives in process memory, so it resets on restart and is
 * per-instance (the PM2 config runs a single instance, so that is fine). Put a
 * real limiter (Redis / reverse proxy) in front if you ever scale out.
 */
const hits = new Map<string, number[]>()

export function isRateLimited(key: string, max = 8, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  hits.set(key, recent)
  return recent.length >= max
}

export function recordFailure(key: string, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k)
}

export function clearFailures(key: string) {
  hits.delete(key)
}
