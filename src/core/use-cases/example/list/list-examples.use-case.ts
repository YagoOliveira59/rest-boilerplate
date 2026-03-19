import { inject, singleton } from 'tsyringe'

import type { IExampleRepository } from '@/core/domain/example/repository/example.repository.interfaces'
import { InputListExamplesDto, OutputListExamplesDto } from '@/core/use-cases/example/list/list-examples.dto'
import ExampleCommonDtoMapper from '@/core/use-cases/example/shared/example.common-dto.mapper'

@singleton()
export default class ListExamplesUseCase {
  constructor(
    @inject('IExampleRepository') private readonly exampleRepository: IExampleRepository,
    @inject(ExampleCommonDtoMapper) private readonly exampleMapper: ExampleCommonDtoMapper
  ) {}

  async execute(input: InputListExamplesDto): Promise<OutputListExamplesDto> {
    const examples = await this.exampleRepository.findAll({ active: input.active })

    return examples.map((e) => this.exampleMapper.toCommonDto(e))
  }
}
