import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'

/**
 * Sessions are JWTs, so a deactivated account would otherwise stay signed in
 * until the token expires. Every guard re-checks `isActive` against the DB.
 */
async function isUserActive(userId: string | undefined) {
  if (!userId) return false
  const u = await db.user.findUnique({ where: { id: userId }, select: { isActive: true } })
  return !!u?.isActive
}

/** For Server Actions: throws so the calling form can show an inline error. */
export async function requireAdmin() {
  const s = await auth()
  if (s?.user?.role !== 'SUPER_ADMIN' || !(await isUserActive(s.user.id))) throw new Error('Hanya admin yang boleh melakukan ini.')
  return { userId: s.user.id! }
}

export async function requireAthlete() {
  const s = await auth()
  if (!s?.user?.athleteId || !(await isUserActive(s.user.id))) throw new Error('Masuk dulu sebagai pemain.')
  return { athleteId: s.user.athleteId, userId: s.user.id! }
}

/** Any signed-in, active account (athlete, trainer, referee or admin) — e.g. for changing your own password. */
export async function requireUser() {
  const s = await auth()
  if (!s?.user?.id || !(await isUserActive(s.user.id))) throw new Error('Masuk dulu.')
  return { userId: s.user.id, role: s.user.role }
}

/**
 * For Server Components (layouts/pages): redirects instead of throwing an
 * error boundary. Middleware already gates these routes by role — this is a
 * second, in-process check so each admin page is still correct even if it's
 * ever rendered outside the matcher (e.g. a route added later that forgets
 * to update middleware.ts).
 */
export async function requireAdminPage() {
  const s = await auth()
  if (s?.user?.role !== 'SUPER_ADMIN' || !(await isUserActive(s.user.id))) redirect('/login')
  return s.user
}

/** Sends a signed-in user to the home area that matches their actual role. */
export function roleHome(role?: string) {
  if (role === 'SUPER_ADMIN') return '/admin'
  if (role === 'TRAINER' || role === 'REFEREE') return '/staff'
  return '/dashboard'
}

/** For the (athlete) layout: only ATHLETE belongs here — everyone else gets bounced to their own area. */
export async function requireAthletePage() {
  const s = await auth()
  if (!s?.user || !(await isUserActive(s.user.id))) redirect('/login')
  if (s.user.role !== 'ATHLETE') redirect(roleHome(s.user.role))
  return s.user
}

/** For the /staff layout: TRAINER and REFEREE accounts only. */
export async function requireStaffPage() {
  const s = await auth()
  if (!s?.user || !(await isUserActive(s.user.id))) redirect('/login')
  if (s.user.role !== 'TRAINER' && s.user.role !== 'REFEREE') redirect(roleHome(s.user.role))
  return s.user
}
