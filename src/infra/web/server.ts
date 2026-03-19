import { Server as HttpServer } from 'http'
import { inject, singleton } from 'tsyringe'

import type { ICacheProvider } from '@/core/providers/cache/cache.provider.interfaces'

import ApiExpress from '@/infra/web/express'

import EnvConfig from '@/main/config/env.config'
import LoggerConfig from '@/main/config/logger.config'
import { shutdownHandler as telemetryShutdownHandler } from '@/main/instrumentation'

/**
 * HTTP server bootstrap.
 *
 * Connects to the cache, starts listening, and sets up graceful shutdown
 * for production environments (SIGINT / SIGTERM).
 */
@singleton()
export default class Server {
  constructor(
    @inject(LoggerConfig) private readonly loggerConfig: LoggerConfig,
    @inject(EnvConfig) private readonly envConfig: EnvConfig,
    @inject(ApiExpress) private readonly api: ApiExpress,
    @inject('ICacheProvider') private readonly cacheProvider: ICacheProvider
  ) {}

  public async start(): Promise<void> {
    const { structured } = this.loggerConfig
    const { env } = this.envConfig

    try {
      await this.cacheProvider.connect()

      const server = this.api.app.listen(env.PORT, () => {
        structured.info('Server started successfully', {
          operation: 'app.start',
          port: env.PORT,
          environment: env.NODE_ENV
        })
      })

      server.on('error', (error) => {
        structured.error('Server failed to start', error as Error, {
          operation: 'app.start',
          port: env.PORT
        })
        process.exit(1)
      })

      if (env.NODE_ENV === 'production') {
        this.setupGracefulShutdown(server)
      }
    } catch (error) {
      structured.error('Failed to bootstrap application server', error as Error, {
        operation: 'app.bootstrap'
      })
      process.exit(1)
    }
  }

  private setupGracefulShutdown(server: HttpServer) {
    const { structured } = this.loggerConfig

    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
    signals.forEach((signal) => {
      process.on(signal, () => {
        structured.info('Server shutting down gracefully', { operation: 'app.shutdown', signal })
        server.close(() => {
          structured.info('Server closed successfully', { operation: 'app.shutdown' })
          telemetryShutdownHandler(signal)
          process.exit(0)
        })
      })
    })
  }
}
