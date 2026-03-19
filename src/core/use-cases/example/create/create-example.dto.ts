import { BasePayload } from '@/core/providers/messaging/messaging.provider.interfaces'
import { ExampleCommonDto } from '@/core/use-cases/example/shared/example.common-dto'

// TODO: Add all required input fields for your entity's create operation
export interface InputCreateExampleDto {
  name: string
  description?: string | undefined
  requestData: BasePayload
}

export type OutputCreateExampleDto = ExampleCommonDto
