/**
 * Standardized Log Fields for structured logging (GCP Cloud Logging compatible).
 *
 * TODO: Add domain-specific fields (e.g., orderId, productId) to LogContext
 * and update formatContext in StructuredLogger accordingly.
 */

export interface BaseLogData {
  /** Request trace ID for distributed tracing */
  traceId?: string
  /** Operator/user ID performing the action */
  operatorId?: string
}

export interface LogContext extends BaseLogData {
  /** Arbitrary entity ID for the current domain operation */
  entityId?: string
  /** Operation or action name (e.g., 'example.create') */
  operation?: string
  /** HTTP request path */
  path?: string
  /** HTTP method */
  method?: string
  /** HTTP status code */
  statusCode?: number
  /** Request duration in milliseconds */
  durationMs?: number
  /** Allow additional properties */
  [key: string]: unknown
}

export interface ErrorContext extends LogContext {
  errorName: string
  errorMessage: string
  errorStack?: string
  errorCode?: string
  httpStatus?: number
}

export interface DatabaseContext extends LogContext {
  dbOperation?: string
  dbTable?: string
  dbRowsAffected?: number
  dbDurationMs?: number
}

export interface ExternalServiceContext extends LogContext {
  serviceName: string
  serviceOperation?: string
  serviceResponseMs?: number
  serviceStatus?: string
}

export interface AuditContext extends LogContext {
  entityType: string
  entityId: string
  action: string
  ipAddress?: string
  changes?: Record<string, unknown>
}

export enum LogEventType {
  APP_START = 'app.start',
  APP_SHUTDOWN = 'app.shutdown',
  HTTP_REQUEST = 'http.request',
  HTTP_RESPONSE = 'http.response',
  HTTP_ERROR = 'http.error',
  DB_QUERY = 'db.query',
  DB_TRANSACTION = 'db.transaction',
  DB_ERROR = 'db.error',
  SERVICE_CALL = 'service.call',
  SERVICE_ERROR = 'service.error',
  BUSINESS_OPERATION = 'business.operation',
  BUSINESS_ERROR = 'business.error',
  AUDIT_CREATE = 'audit.create',
  AUDIT_UPDATE = 'audit.update',
  AUDIT_DELETE = 'audit.delete',
  CACHE_HIT = 'cache.hit',
  CACHE_MISS = 'cache.miss',
  CACHE_ERROR = 'cache.error',
  AUTH_SUCCESS = 'auth.success',
  AUTH_FAILURE = 'auth.failure',
  UNAUTHORIZED = 'auth.unauthorized'
}
