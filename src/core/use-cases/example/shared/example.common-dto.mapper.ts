import { singleton } from 'tsyringe'

import { IExample } from '@/core/domain/example/entity/example.interfaces'
import { BasePayload } from '@/core/providers/messaging/messaging.provider.interfaces'
import { ExampleCommonDto, ExampleEventPayload } from '@/core/use-cases/example/shared/example.common-dto'

// TODO: Update mappings to include all fields from your domain entity

@singleton()
export default class ExampleCommonDtoMapper {
  public toCommonDto(example: IExample): ExampleCommonDto {
    return {
      id: example.id.value,
      name: example.name,
      description: example.description,
      active: example.active,
      createdAt: example.createdAt,
      updatedAt: example.updatedAt
    }
  }

  public toEventPayload(example: IExample, requestData: BasePayload): ExampleEventPayload {
    return {
      id: example.id.value,
      name: example.name,
      active: example.active,
      ip: requestData.ip,
      userId: requestData.user?.userId
    }
  }
}
