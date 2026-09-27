import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      role: string
      athleteId?: string
    } & DefaultSession['user']
  }
  interface User {
    role: string
    athleteId?: string
    phone?: string
  }
}
