import { PrismaClient } from '@prisma/client'
import { inject, singleton } from 'tsyringe'

import EnvConfig from '@/main/config/env.config'

/**
 * Singleton Prisma client provider.
 *
 * Supports two connection strategies:
 *   - Local development: DATABASE_URL from .env
 *   - Google Cloud SQL (production): Unix socket via CLOUD_SQL_INSTANCE + POSTGRES_* vars
 *
 * TODO: Remove Cloud SQL support if you're not deploying to GCP.
 */
@singleton()
export default class PrismaClientProvider {
  public readonly client: PrismaClient

  constructor(@inject(EnvConfig) private envConfig: EnvConfig) {
    const isProduction = this.envConfig.env.NODE_ENV === 'production'

    const cloudSqlInstance = this.envConfig.env.CLOUD_SQL_INSTANCE
    const password = this.envConfig.env.POSTGRES_PASSWORD
    const user = this.envConfig.env.POSTGRES_USER
    const database = this.envConfig.env.POSTGRES_DB

    let databaseUrl: string

    if (cloudSqlInstance && password) {
      // Production: Cloud SQL Unix socket connection
      const encodedPassword = encodeURIComponent(password)
      databaseUrl = `postgresql://${user}:${encodedPassword}@localhost/${database}?host=/cloudsql/${cloudSqlInstance}`
    } else {
      // Local development: use DATABASE_URL from .env
      databaseUrl = this.envConfig.env.DATABASE_URL
    }

    this.client = new PrismaClient({
      log: isProduction ? ['error'] : ['query', 'info', 'warn', 'error'],
      errorFormat: isProduction ? 'minimal' : 'pretty',
      datasources: {
        db: { url: databaseUrl }
      }
    })
  }
}
