import { inject, singleton } from 'tsyringe'

import type { IExampleRepository } from '@/core/domain/example/repository/example.repository.interfaces'
import UUIDv7 from '@/core/domain/value-objects/uuid/uuid'
import { InputGetExampleByIdDto, OutputGetExampleByIdDto } from '@/core/use-cases/example/get-by-id/get-example-by-id.dto'
import ExampleCommonDtoMapper from '@/core/use-cases/example/shared/example.common-dto.mapper'
import { ExampleNotFoundError } from '@/core/use-cases/example/shared/example.use-cases.errors'

@singleton()
export default class GetExampleByIdUseCase {
  constructor(
    @inject('IExampleRepository') private readonly exampleRepository: IExampleRepository,
    @inject(ExampleCommonDtoMapper) private readonly exampleMapper: ExampleCommonDtoMapper
  ) {}

  async execute(input: InputGetExampleByIdDto): Promise<OutputGetExampleByIdDto> {
    const example = await this.exampleRepository.findById(new UUIDv7(input.id))

    if (!example) {
      throw new ExampleNotFoundError({ id: input.id })
    }

    return this.exampleMapper.toCommonDto(example)
  }
}
