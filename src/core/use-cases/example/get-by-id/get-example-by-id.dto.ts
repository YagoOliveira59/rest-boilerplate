import { ExampleCommonDto } from '@/core/use-cases/example/shared/example.common-dto'

export interface InputGetExampleByIdDto {
  id: string
}

export type OutputGetExampleByIdDto = ExampleCommonDto
