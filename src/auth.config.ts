import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe half of the config: no Prisma calls here, so this file can be
 * imported by middleware.ts (which runs on the Edge runtime). The Credentials
 * provider itself — which does touch the database — lives in src/auth.ts and
 * is only pulled into the Node.js route handler.
 */
export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const path = request.nextUrl.pathname
      const isAdminRoute = path.startsWith('/admin')
      const isAthleteRoute = ['/dashboard', '/find-opponent', '/matches', '/settings'].some((p) => path.startsWith(p))
      const isStaffRoute = path.startsWith('/staff')

      if (isAdminRoute) return isLoggedIn && auth?.user?.role === 'SUPER_ADMIN'
      if (isAthleteRoute) return isLoggedIn
      if (isStaffRoute) return isLoggedIn
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.athleteId = user.athleteId
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.athleteId = token.athleteId as string | undefined
      }
      return session
    },
  },
  providers: [], // populated in src/auth.ts
} satisfies NextAuthConfig
