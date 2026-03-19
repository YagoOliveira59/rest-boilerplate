import { ExampleCommonDto } from '@/core/use-cases/example/shared/example.common-dto'

export interface InputListExamplesDto {
  active?: boolean | undefined
}

export type OutputListExamplesDto = ExampleCommonDto[]
