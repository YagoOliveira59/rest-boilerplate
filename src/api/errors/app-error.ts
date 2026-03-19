import { IAppError, ErrorProps } from '@/api/errors/app-error.interfaces'
import { ErrorCode } from '@/api/errors/error-code'
import { HttpStatus } from '@/api/shared/http-status'

export default class AppError extends Error implements IAppError {
  public readonly code: ErrorCode
  public readonly statusCode: HttpStatus
  public readonly additionalInfo: Record<string, unknown>

  constructor({ errorCode, statusCode, message, additionalLogInfo }: ErrorProps) {
    super(message)

    this.code = errorCode
    this.statusCode = statusCode
    this.additionalInfo = additionalLogInfo || {}
  }

  public getResponseError(): { code: ErrorCode; message: string } {
    return {
      code: this.code,
      message: this.message
    }
  }
}
