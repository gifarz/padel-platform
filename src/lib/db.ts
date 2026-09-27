import { PrismaClient } from '@prisma/client'

/**
 * Next.js hot-reloads modules in dev, which would otherwise create a new
 * PrismaClient (and a new connection pool) on every file save. Stashing it
 * on `globalThis` keeps a single instance alive across reloads.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
