import { createGcpLoggingPinoConfig } from '@google-cloud/pino-logging-gcp-config'
import pino, { Logger as PinoLogger, LoggerOptions } from 'pino'
import { inject, singleton } from 'tsyringe'

import EnvConfig from '@/main/config/env.config'
import { StructuredLogger } from '@/main/config/logger/structured-logger'

/**
 * Logger configuration singleton.
 *
 * In test environments: silent (no output)
 * In development: pino-pretty (colorized, human-readable)
 * In production: GCP Cloud Logging JSON format
 *
 * TODO: Update the GCP service name on line with createGcpLoggingPinoConfig
 */
@singleton()
export default class LoggerConfig {
  public readonly logger: PinoLogger
  public readonly structured: StructuredLogger

  constructor(@inject(EnvConfig) private readonly envConfig: EnvConfig) {
    const options = this.getOptions()
    this.logger = pino(options)
    this.structured = new StructuredLogger(this.logger)
  }

  private getOptions(): LoggerOptions {
    const { env } = this.envConfig

    if (env.NODE_ENV === 'test') {
      return { level: 'silent' }
    }

    if (env.NODE_ENV === 'production') {
      // TODO: Update service name to match your project
      return createGcpLoggingPinoConfig({ serviceContext: { service: 'rest-boilerplate' } })
    }

    return {
      level: env.LOG_LEVEL,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
          translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
          ignore: 'pid,hostname'
        }
      }
    }
  }
}
