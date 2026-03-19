import 'reflect-metadata'
import { container } from 'tsyringe'

import ExampleController from '@/api/controllers/example.controller'
import HealthController from '@/api/controllers/health.controller'
import ExampleRouter from '@/api/routers/example.router'
import HealthRouter from '@/api/routers/health.router'

// TODO: Import additional controllers and routers as you add entities

import { IExampleRepository } from '@/core/domain/example/repository/example.repository.interfaces'
import { ICacheProvider } from '@/core/providers/cache/cache.provider.interfaces'
import { IMessagingProvider } from '@/core/providers/messaging/messaging.provider.interfaces'
import CreateExampleUseCase from '@/core/use-cases/example/create/create-example.use-case'
import GetExampleByIdUseCase from '@/core/use-cases/example/get-by-id/get-example-by-id.use-case'
import ListExamplesUseCase from '@/core/use-cases/example/list/list-examples.use-case'
import ExampleCommonDtoMapper from '@/core/use-cases/example/shared/example.common-dto.mapper'

// TODO: Import additional use cases and domain components as you add entities

import PrismaClientProvider from '@/infra/database/prisma/client.prisma'
import PrismaTransactionWrapper from '@/infra/database/prisma/helpers/prisma.transaction-wrapper'
import ExampleRepositoryMapper from '@/infra/database/repositories/example/example.repository.mapper'
import ExampleRepository from '@/infra/database/repositories/example/example.repository'
import RedisProvider from '@/infra/providers/cache/redis.provider'
import PubSubProvider from '@/infra/providers/messaging/pubsub.provider'
import ApiExpress from '@/infra/web/express'
import Server from '@/infra/web/server'

import EnvConfig from '@/main/config/env.config'
import LoggerConfig from '@/main/config/logger.config'
import SwaggerConfig from '@/main/config/swagger.config'

// ── Infra: Providers ──────────────────────────────────────────────────────────
container.registerSingleton<ICacheProvider>('ICacheProvider', RedisProvider)
container.registerSingleton<IMessagingProvider>('IMessagingProvider', PubSubProvider)

// ── Infra: Database ───────────────────────────────────────────────────────────
container.registerSingleton(PrismaClientProvider)
container.registerSingleton('IUnitOfWork', PrismaTransactionWrapper)

// ── Infra: Repository Mappers ─────────────────────────────────────────────────
container.registerSingleton(ExampleRepositoryMapper)

// ── Infra: Repositories ───────────────────────────────────────────────────────
container.registerSingleton<IExampleRepository>('IExampleRepository', ExampleRepository)

// TODO: Register additional repositories here following the same pattern

// ── Core: Use Cases ───────────────────────────────────────────────────────────
container.registerSingleton(CreateExampleUseCase)
container.registerSingleton(ListExamplesUseCase)
container.registerSingleton(GetExampleByIdUseCase)

// ── Core: Use Case Mappers ────────────────────────────────────────────────────
container.registerSingleton(ExampleCommonDtoMapper)

// ── API: Controllers ──────────────────────────────────────────────────────────
container.registerSingleton(HealthController)
container.registerSingleton(ExampleController)

// ── API: Routers ──────────────────────────────────────────────────────────────
container.registerSingleton(HealthRouter)
container.registerSingleton(ExampleRouter)

// ── Main: Config ──────────────────────────────────────────────────────────────
container.registerSingleton(EnvConfig)
container.registerSingleton(LoggerConfig)
container.registerSingleton(SwaggerConfig)

// ── API Express app ───────────────────────────────────────────────────────────
container.registerSingleton(ApiExpress)

// ── Server ────────────────────────────────────────────────────────────────────
container.registerSingleton(Server)

export { container }
