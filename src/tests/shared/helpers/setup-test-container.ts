import 'reflect-metadata'
import { container } from 'tsyringe'
import { mockDeep } from 'jest-mock-extended'

import { IExampleRepository } from '@/core/domain/example/repository/example.repository.interfaces'
import { ICacheProvider } from '@/core/providers/cache/cache.provider.interfaces'
import { IMessagingProvider } from '@/core/providers/messaging/messaging.provider.interfaces'

import { AuditContext } from '@/infra/database/prisma/helpers/audit.interfaces'
import { IUnitOfWork } from '@/infra/database/prisma/helpers/unit-of-work.port'

import EnvConfig from '@/main/config/env.config'
import LoggerConfig from '@/main/config/logger.config'

/**
 * Sets up a minimal DI container with mocked dependencies for unit/integration tests.
 *
 * Usage:
 * ```typescript
 * const { mocks } = setupTestContainer()
 * mocks.exampleRepository.findById.mockResolvedValue(null)
 * ```
 *
 * TODO: Add mocks for additional repositories as your project grows.
 */
export function setupTestContainer() {
  container.clearInstances()

  const mocks = {
    exampleRepository: mockDeep<IExampleRepository>(),
    messagingProvider: mockDeep<IMessagingProvider>(),
    cacheProvider: mockDeep<ICacheProvider>(),
    unitOfWork: {
      run: jest.fn().mockImplementation(async (_ctx: AuditContext, callback: (tx: unknown) => Promise<unknown>) => {
        return callback({})
      })
    } as unknown as IUnitOfWork<never>
  }

  container.registerInstance('IExampleRepository', mocks.exampleRepository)
  container.registerInstance('IMessagingProvider', mocks.messagingProvider)
  container.registerInstance('ICacheProvider', mocks.cacheProvider)
  container.registerInstance('IUnitOfWork', mocks.unitOfWork)
  container.registerSingleton(EnvConfig)
  container.registerSingleton(LoggerConfig)

  return { mocks }
}

/**
 * Creates a mock audit context for use in tests.
 *
 * TODO: Update the operatorId format if your ExternalId uses a different format.
 */
export function createMockAuditContext(): AuditContext {
  const { ExternalId } = require('@/core/domain/value-objects/external-id/external-id')

  return {
    operator: new ExternalId.default('507f1f77bcf86cd799439011'),
    traceId: 'test-trace-id',
    originAction: 'TEST_ACTION'
  }
}
