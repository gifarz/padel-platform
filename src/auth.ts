import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { normalizeIndonesianPhone } from '@/lib/phone'
import { isRateLimited, recordFailure, clearFailures } from '@/lib/rate-limit'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { phone: {}, password: {} },
      async authorize(credentials) {
        const rawPhone = credentials?.phone as string | undefined
        const password = credentials?.password as string | undefined
        if (!rawPhone || !password) return null

        const phone = normalizeIndonesianPhone(rawPhone)
        if (!phone) return null

        // Brute-force guard: too many recent failures for this number → refuse without touching bcrypt.
        const limitKey = `login:${phone}`
        if (isRateLimited(limitKey)) return null

        const user = await db.user.findUnique({
          where: { phone },
          include: { athlete: { select: { id: true } } },
        })
        if (!user || !user.isActive) { recordFailure(limitKey); return null }

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) { recordFailure(limitKey); return null }
        clearFailures(limitKey)

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          athleteId: user.athlete?.id,
        }
      },
    }),
  ],
})
