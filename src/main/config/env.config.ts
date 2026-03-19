import 'dotenv/config'
import { keys, pick } from 'remeda'
import { singleton } from 'tsyringe'
import z from 'zod'

// TODO: Add/remove environment variables as your project requires.
// Each variable is validated with Zod — add type coercions, defaults, and constraints here.
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // TODO: Change default port to match your service
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

    // ── Database ────────────────────────────────────────────────────────────
    POSTGRES_DB: z.string().default('myapp'),
    POSTGRES_USER: z.string().default('postgres'),
    POSTGRES_PASSWORD: z.string().optional(),
    // Cloud SQL instance for GCP production (format: project:region:instance)
    CLOUD_SQL_INSTANCE: z.string().optional(),
    DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/myapp'),

    // ── Cache ───────────────────────────────────────────────────────────────
    REDIS_URL: z.string().default('redis://localhost:6379/0'),

    // ── Messaging (Pub/Sub) ─────────────────────────────────────────────────
    PUBSUB_PROJECT_ID: z.string().optional(),
    PUBSUB_EMULATOR_HOST: z.string().optional(),
    PUBSUB_EVENTS_TOPIC: z.string().default('events'),

    // ── OpenTelemetry ───────────────────────────────────────────────────────
    OTEL_ENABLED: z
      .string()
      .default('true')
      .transform((val) => val === 'true' || val === '1'),
    OTEL_EXPORTER: z.enum(['gcp', 'console']).default('console'),
    OTEL_SAMPLING_RATE: z.coerce.number().min(0).max(1).default(0.5),
    OTEL_FORCE_TRACE_HEADER: z.string().default('x-force-trace'),
    GCP_PROJECT_ID: z.string().optional()
  })
  .strict()

type Env = z.infer<typeof envSchema>

@singleton()
export default class EnvConfig {
  public readonly env: Env

  constructor() {
    this.env = envSchema.parse(pick(process.env, keys(envSchema.shape)))
  }
}
