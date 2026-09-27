import { redirect } from 'next/navigation'
import { auth } from '@/auth'

/** For Server Actions: throws so the calling form can show an inline error. */
export async function requireAdmin() {
  const s = await auth()
  if (s?.user?.role !== 'SUPER_ADMIN') throw new Error('Hanya admin yang boleh melakukan ini.')
  return { userId: s.user.id! }
}

export async function requireAthlete() {
  const s = await auth()
  if (!s?.user?.athleteId) throw new Error('Masuk sebagai atlet dulu.')
  return { athleteId: s.user.athleteId, userId: s.user.id! }
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
  if (s?.user?.role !== 'SUPER_ADMIN') redirect('/login')
  return s!.user
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
  if (!s?.user) redirect('/login')
  if (s.user.role !== 'ATHLETE') redirect(roleHome(s.user.role))
  return s.user
}

/** For the /staff layout: TRAINER and REFEREE accounts only. */
export async function requireStaffPage() {
  const s = await auth()
  if (!s?.user) redirect('/login')
  if (s.user.role !== 'TRAINER' && s.user.role !== 'REFEREE') redirect(roleHome(s.user.role))
  return s.user
}
