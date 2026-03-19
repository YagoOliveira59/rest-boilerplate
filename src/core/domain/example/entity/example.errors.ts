import { CoreValidationError, CoreForbiddenActionError } from '@/core/errors/core.errors'

// TODO: Add domain-specific error classes for your entity below

export class ExampleValidationError extends CoreValidationError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'ExampleValidationError'
  }
}

export class ExampleInactiveError extends CoreForbiddenActionError {
  constructor(metadata?: Record<string, unknown>) {
    super('Cannot modify an inactive example', metadata)
    this.name = 'ExampleInactiveError'
  }
}
