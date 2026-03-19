import { CoreDuplicationError, CoreNotFoundError } from '@/core/errors/core.errors'

// TODO: Add use-case-specific errors for your entity

export class ExampleAlreadyExistsError extends CoreDuplicationError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'ExampleAlreadyExistsError'
  }
}

export class ExampleNotFoundError extends CoreNotFoundError {
  constructor(metadata?: Record<string, unknown>) {
    super('Example not found', metadata)
    this.name = 'ExampleNotFoundError'
  }
}
