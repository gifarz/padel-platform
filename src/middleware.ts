import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

/** Runs on the Edge runtime, so it uses the Prisma-free half of the auth config. */
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/find-opponent/:path*', '/matches/:path*', '/settings/:path*', '/staff/:path*'],
}
