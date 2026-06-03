// Prisma config — for migrations (prisma migrate / prisma db push)
// The database URL for runtime is passed to PrismaClient constructor separately.
import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: { url: process.env.SUPABASE_DATABASE_URL },
})
