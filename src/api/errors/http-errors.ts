import AppError from '@/api/errors/app-error'
import { ErrorCode } from '@/api/errors/error-code'
import { HttpStatus } from '@/api/shared/http-status'

export class InternalServerError extends AppError {
  constructor(additionalLogInfo: Record<string, unknown> = {}, message: string = 'Internal server error') {
    super({
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      additionalLogInfo
    })
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    additionalLogInfo: Record<string, unknown> = {},
    message: string = 'Unauthorized user',
    errorCode: ErrorCode = ErrorCode.UNAUTHORIZED
  ) {
    super({
      errorCode,
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      additionalLogInfo
    })
  }
}

export class ForbiddenError extends AppError {
  constructor(
    additionalLogInfo: Record<string, unknown> = {},
    message: string = 'Forbidden user access',
    errorCode: ErrorCode = ErrorCode.FORBIDDEN
  ) {
    super({
      errorCode,
      statusCode: HttpStatus.FORBIDDEN,
      message,
      additionalLogInfo
    })
  }
}

export class BadRequestError extends AppError {
  constructor(
    additionalLogInfo: Record<string, unknown> = {},
    message: string = 'Bad request',
    errorCode: ErrorCode = ErrorCode.BAD_REQUEST
  ) {
    super({
      errorCode,
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      additionalLogInfo
    })
  }
}

export class NotFoundError extends AppError {
  constructor(additionalLogInfo: Record<string, unknown> = {}, message: string = 'Not found') {
    super({
      errorCode: ErrorCode.NOT_FOUND,
      statusCode: HttpStatus.NOT_FOUND,
      message,
      additionalLogInfo
    })
  }
}

export class ConflictError extends AppError {
  constructor(additionalLogInfo: Record<string, unknown> = {}, message: string = 'Conflict') {
    super({
      errorCode: ErrorCode.CONFLICT,
      statusCode: HttpStatus.CONFLICT,
      message,
      additionalLogInfo
    })
  }
}
