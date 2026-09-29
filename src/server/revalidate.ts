import 'server-only'
import { revalidatePath } from 'next/cache'

/**
 * Public pages (landing page stats, ranking, club/tournament/player lists…)
 * are rendered from the database but have no cookies/searchParams, so Next.js
 * prerenders them once and keeps serving that snapshot. Any admin mutation
 * that changes what those pages show must call this — otherwise the change
 * only appears after the next build/restart.
 */
export function revalidatePublicSite() {
  revalidatePath('/', 'layout')
}
