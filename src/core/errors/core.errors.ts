/**
 * Core domain errors
 *
 * Throw these from the core layer (use-cases, entities, services).
 * The error middleware in the API layer maps them to HTTP errors automatically.
 *
 * Mapping:
 *   CoreValidationError      → 400 Bad Request
 *   CoreNotFoundError        → 404 Not Found
 *   CoreDuplicationError     → 409 Conflict
 *   CoreForbiddenActionError → 403 Forbidden
 *   CoreUnauthorizedError    → 401 Unauthorized
 */

export class CoreValidationError extends Error {
  public readonly metadata: Record<string, unknown>

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message)
    this.name = 'CoreValidationError'
    this.metadata = metadata ?? {}
  }
}

export class CoreNotFoundError extends Error {
  public readonly metadata: Record<string, unknown>

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message)
    this.name = 'CoreNotFoundError'
    this.metadata = metadata ?? {}
  }
}

export class CoreForbiddenActionError extends Error {
  public readonly metadata: Record<string, unknown>

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message)
    this.name = 'CoreForbiddenActionError'
    this.metadata = metadata ?? {}
  }
}

export class CoreDuplicationError extends Error {
  public readonly metadata: Record<string, unknown>

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message)
    this.name = 'CoreDuplicationError'
    this.metadata = metadata ?? {}
  }
}

export class CoreUnauthorizedError extends Error {
  public readonly metadata: Record<string, unknown>

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message)
    this.name = 'CoreUnauthorizedError'
    this.metadata = metadata ?? {}
  }
}
