// Prisma client singleton — lazy initialization, safe for Next.js build
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    // PrismaClient reads DATABASE_URL by default at runtime
    // If only SUPABASE_DATABASE_URL is set, proxy it
    if (!process.env.DATABASE_URL && process.env.SUPABASE_DATABASE_URL) {
      process.env.DATABASE_URL = process.env.SUPABASE_DATABASE_URL
    }
    globalForPrisma.prisma = new PrismaClient()
  }
  return globalForPrisma.prisma
}