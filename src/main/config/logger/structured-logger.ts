import type { Logger as PinoLogger } from 'pino'

import type {
  AuditContext,
  DatabaseContext,
  ErrorContext,
  ExternalServiceContext,
  LogContext
} from '@/main/config/logger/log-fields'
import { LogEventType } from '@/main/config/logger/log-fields'

/**
 * Type-safe structured logger wrapper over Pino.
 *
 * Enforces consistent log format for GCP Cloud Logging.
 * Use the domain-specific methods (dbOperation, serviceCall, audit)
 * rather than raw logger.info() calls.
 *
 * TODO: Add project-specific context fields to formatContext()
 * (e.g., orderId, tenantId) as your domain grows.
 */
export class StructuredLogger {
  constructor(private readonly logger: PinoLogger) {}

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.formatContext(context), message)
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(this.formatContext(context), message)
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.formatContext(context), message)
  }

  error(message: string, error: Error, context?: LogContext): void {
    const errorContext = this.buildErrorContext(error, context)
    this.logger.error(errorContext, message)
  }

  httpRequest(message: string, context: LogContext & { method: string; path: string; statusCode?: number }): void {
    this.logger.info({ ...this.formatContext(context), eventType: LogEventType.HTTP_REQUEST }, message)
  }

  httpResponse(
    message: string,
    context: LogContext & { method: string; path: string; statusCode: number; durationMs: number }
  ): void {
    const level = context.statusCode >= 500 ? 'error' : context.statusCode >= 400 ? 'warn' : 'info'
    this.logger[level]({ ...this.formatContext(context), eventType: LogEventType.HTTP_RESPONSE }, message)
  }

  dbOperation(message: string, context: DatabaseContext): void {
    this.logger.info({ ...this.formatContext(context), eventType: LogEventType.DB_QUERY }, message)
  }

  dbTransaction(message: string, context: DatabaseContext): void {
    this.logger.info({ ...this.formatContext(context), eventType: LogEventType.DB_TRANSACTION }, message)
  }

  serviceCall(message: string, context: ExternalServiceContext): void {
    this.logger.info({ ...this.formatContext(context), eventType: LogEventType.SERVICE_CALL }, message)
  }

  audit(message: string, context: AuditContext): void {
    const eventType =
      context.action === 'created'
        ? LogEventType.AUDIT_CREATE
        : context.action === 'updated'
          ? LogEventType.AUDIT_UPDATE
          : LogEventType.AUDIT_DELETE

    this.logger.info({ ...this.formatContext(context), eventType }, message)
  }

  cacheHit(key: string, context?: LogContext): void {
    this.logger.debug({ ...this.formatContext(context), eventType: LogEventType.CACHE_HIT, cacheKey: key }, 'Cache hit')
  }

  cacheMiss(key: string, context?: LogContext): void {
    this.logger.debug({ ...this.formatContext(context), eventType: LogEventType.CACHE_MISS, cacheKey: key }, 'Cache miss')
  }

  getUnderlyingLogger(): PinoLogger {
    return this.logger
  }

  private formatContext(context?: LogContext): Record<string, unknown> {
    if (!context) return {}

    const formatted: Record<string, unknown> = {}

    // TODO: Map your domain-specific fields to GCP-friendly names here
    // eslint-disable-next-line dot-notation
    if (context.traceId) formatted['trace_id'] = context.traceId
    // eslint-disable-next-line dot-notation
    if (context.operatorId) formatted['operator_id'] = context.operatorId
    // eslint-disable-next-line dot-notation
    if (context.operation) formatted['operation'] = context.operation
    // eslint-disable-next-line dot-notation
    if (context.path) formatted['http_path'] = context.path
    // eslint-disable-next-line dot-notation
    if (context.method) formatted['http_method'] = context.method
    // eslint-disable-next-line dot-notation
    if (context.statusCode) formatted['http_status'] = context.statusCode
    // eslint-disable-next-line dot-notation
    if (context.durationMs !== undefined) formatted['duration_ms'] = context.durationMs

    return formatted
  }

  private buildErrorContext(error: Error, context?: LogContext): ErrorContext {
    const errorContext: ErrorContext = {
      ...this.formatContext(context),
      errorName: error.name,
      errorMessage: error.message,
      eventType: LogEventType.BUSINESS_ERROR
    }
    const sanitizedStack = this.sanitizeStack(error.stack)
    if (sanitizedStack) errorContext.errorStack = sanitizedStack
    return errorContext
  }

  private sanitizeStack(stack?: string): string | undefined {
    if (!stack) return undefined
    return stack
      .split('\n')
      .map((line) => line.replace(/.*\/(src|build)\//, '$1/'))
      .join('\n')
  }
}
