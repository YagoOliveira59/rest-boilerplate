import path from 'node:path'
import type { PrismaConfig } from 'prisma'

// Try to load dotenv if available (optional for CI environments)
try {
  const { config } = await import('dotenv')
  config({ path: path.resolve(process.cwd(), '.env') })
} catch {}

export default {
  schema: path.join('src', 'infra', 'database', 'prisma')
} satisfies PrismaConfig
