import { ErrorCode } from '@/api/errors/error-code'
import { HttpStatus } from '@/api/shared/http-status'

export interface ErrorProps {
  errorCode: ErrorCode
  statusCode: HttpStatus
  message: string
  additionalLogInfo?: Record<string, unknown>
}

export interface IAppError {
  readonly code: ErrorCode
  readonly statusCode: HttpStatus
  readonly additionalInfo: Record<string, unknown>
  getResponseError(): { code: ErrorCode; message: string }
}
