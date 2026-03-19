import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import AppError from '@/api/errors/app-error'
import { ErrorCode } from '@/api/errors/error-code'
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError
} from '@/api/errors/http-errors'
import { HttpStatus } from '@/api/shared/http-status'

import {
  CoreDuplicationError,
  CoreForbiddenActionError,
  CoreNotFoundError,
  CoreUnauthorizedError,
  CoreValidationError
} from '@/core/errors/core.errors'

/**
 * Maps core domain errors and validation errors to HTTP AppErrors.
 * This is the central error translation layer between domain and API.
 */
const setAppErrorType = (error: Error): AppError => {
  if (error instanceof AppError) return error

  if (error instanceof ZodError) {
    const errorMessage = error.issues[0]?.message || 'Invalid request data'
    return new BadRequestError({ validationError: error }, errorMessage, ErrorCode.INVALID_REQUEST_DATA)
  }

  if (error instanceof CoreValidationError) {
    return new BadRequestError({ originalError: error, ...error.metadata }, error.message)
  }
  if (error instanceof CoreNotFoundError) {
    return new NotFoundError({ originalError: error, ...error.metadata }, error.message)
  }
  if (error instanceof CoreDuplicationError) {
    return new ConflictError({ originalError: error, ...error.metadata }, error.message)
  }
  if (error instanceof CoreForbiddenActionError) {
    return new ForbiddenError({ originalError: error, ...error.metadata }, error.message)
  }
  if (error instanceof CoreUnauthorizedError) {
    return new UnauthorizedError({ originalError: error, ...error.metadata }, error.message)
  }

  return new InternalServerError({ systemErrorMessage: error.message, originalStack: error.stack })
}

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const error = setAppErrorType(err)

  if (error.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    req.log.error({ error }, error.message)
  } else {
    req.log.warn({ error }, error.message)
  }

  return res.status(error.statusCode).json(error.getResponseError())
}
