import { inject, singleton } from 'tsyringe'

import Example from '@/core/domain/example/entity/example'
import type { IExampleRepository } from '@/core/domain/example/repository/example.repository.interfaces'
import UUIDv7 from '@/core/domain/value-objects/uuid/uuid'
import { EventTypes } from '@/core/providers/messaging/event-types'
import type { BasePayload, IMessagingProvider } from '@/core/providers/messaging/messaging.provider.interfaces'
import { InputCreateExampleDto, OutputCreateExampleDto } from '@/core/use-cases/example/create/create-example.dto'
import { ExampleEventPayload } from '@/core/use-cases/example/shared/example.common-dto'
import ExampleCommonDtoMapper from '@/core/use-cases/example/shared/example.common-dto.mapper'
import { ExampleAlreadyExistsError } from '@/core/use-cases/example/shared/example.use-cases.errors'

import { AuditContext } from '@/infra/database/prisma/helpers/audit.interfaces'

import LoggerConfig from '@/main/config/logger.config'

/**
 * Create Example use case.
 *
 * TODO: Update the business rules to match your domain (duplication check, validations, etc.)
 *
 * Pattern:
 *   1. Validate input (business rules)
 *   2. Build domain entity
 *   3. Persist via repository (inside audit transaction)
 *   4. Publish domain event
 *   5. Return DTO
 */
@singleton()
export default class CreateExampleUseCase {
  constructor(
    @inject('IExampleRepository') private readonly exampleRepository: IExampleRepository,
    @inject('IMessagingProvider') private readonly messagingProvider: IMessagingProvider,
    @inject(ExampleCommonDtoMapper) private readonly exampleMapper: ExampleCommonDtoMapper,
    @inject(LoggerConfig) private readonly loggerConfig: LoggerConfig
  ) {}

  async execute(input: InputCreateExampleDto, auditContext: AuditContext): Promise<OutputCreateExampleDto> {
    // TODO: Add any pre-creation validation (e.g., uniqueness checks)
    // const existing = await this.exampleRepository.findByName(input.name)
    // if (existing) throw new ExampleAlreadyExistsError(`Example '${input.name}' already exists`, { name: input.name })

    const now = new Date()
    const example = new Example(
      {
        id: new UUIDv7(),
        name: input.name,
        description: input.description,
        active: true,
        createdAt: now,
        updatedAt: now
      },
      now
    )

    await this.exampleRepository.create(example, auditContext)

    await this.publishEvent(example, input.requestData)

    this.loggerConfig.structured.info('Example created', { operation: 'example.create' })

    return this.exampleMapper.toCommonDto(example)
  }

  private async publishEvent(example: Example, requestData: BasePayload): Promise<void> {
    const payload = this.exampleMapper.toEventPayload(example, requestData)
    await this.messagingProvider.publish<ExampleEventPayload>({
      eventType: EventTypes.EXAMPLE_CREATED,
      payload,
      ...(requestData.user && { requestingUserId: requestData.user.userId })
    })
  }
}
