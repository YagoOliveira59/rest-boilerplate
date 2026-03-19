import cors from 'cors'
import express, { Express } from 'express'
import pino from 'pino-http'
import swaggerUi from 'swagger-ui-express'
import { inject, singleton } from 'tsyringe'

import { errorMiddleware } from '@/api/middlewares/error.middleware'
import { traceMiddleware } from '@/api/middlewares/trace.middleware'
import ExampleRouter from '@/api/routers/example.router'
import HealthRouter from '@/api/routers/health.router'

// TODO: Import additional routers as you add new domain entities

import EnvConfig from '@/main/config/env.config'
import LoggerConfig from '@/main/config/logger.config'
import SwaggerConfig from '@/main/config/swagger.config'

/**
 * Express application configuration.
 *
 * Registers middleware, Swagger docs, and all route handlers.
 * Error middleware is ALWAYS added last.
 *
 * TODO:
 *  - Add new routers to the constructor and addRoutes()
 *  - Adjust CORS settings for your deployment environment
 *  - Add rate limiting, helmet, or other security middleware as needed
 */
@singleton()
export default class ApiExpress {
  public readonly app: Express

  constructor(
    @inject(LoggerConfig) private readonly loggerConfig: LoggerConfig,
    @inject(EnvConfig) private readonly envConfig: EnvConfig,
    @inject(SwaggerConfig) private readonly swaggerConfig: SwaggerConfig,
    @inject(HealthRouter) private readonly healthRouter: HealthRouter,
    @inject(ExampleRouter) private readonly exampleRouter: ExampleRouter
    // TODO: Inject additional routers here
  ) {
    this.app = express()

    this.config()
    this.addDocs()
    this.addRoutes()

    // Error middleware must be added LAST — it catches all errors thrown in routes
    this.addErrorMiddleware()
  }

  private config(): void {
    this.app.use(pino({ logger: this.loggerConfig.logger }))
    this.app.use(traceMiddleware)
    this.app.use(express.json({ limit: '100kb' }))
    this.app.use(cors({ methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }))
  }

  private addDocs(): void {
    // Swagger docs are only available in development
    if (this.envConfig.env.NODE_ENV === 'development') {
      this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(this.swaggerConfig.swaggerDocument))
    }
  }

  private addRoutes() {
    // Public routes (no auth required)
    this.app.use('/api/health', this.healthRouter.router)

    // Domain entity routes
    // TODO: Uncomment or add your routes below with appropriate auth middleware
    this.app.use('/api/v1/examples', this.exampleRouter.router)
  }

  private addErrorMiddleware() {
    this.app.use(errorMiddleware)
  }
}
