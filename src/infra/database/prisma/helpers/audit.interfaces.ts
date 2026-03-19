import ExternalId from '@/core/domain/value-objects/external-id/external-id'

/**
 * Audit context passed to database transactions.
 * Automatically injected into PostgreSQL session variables for audit trail triggers.
 *
 * @property operator    - ID of the user performing the operation (required)
 * @property ipRequest   - IP address of the request (optional)
 * @property traceId     - Distributed trace ID for request correlation (optional)
 * @property originAction - Action name in UPPER_SNAKE_CASE (optional)
 * @property ignoredFields - Fields excluded from audit diff (optional)
 */
export interface AuditContext {
  operator: ExternalId
  ipRequest?: string | undefined
  traceId?: string | undefined
  originAction?: string | undefined
  ignoredFields?: string[] | undefined
}
