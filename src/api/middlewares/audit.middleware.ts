import { Request } from 'express'

import ExternalId from '@/core/domain/value-objects/external-id/external-id'
import UUIDv7 from '@/core/domain/value-objects/uuid/uuid'

import { AuditContext } from '@/infra/database/prisma/helpers/audit.interfaces'

/**
 * Creates an AuditContext from an Express request.
 *
 * The context is validated later by PrismaTransactionWrapper when used in transactions.
 * It tracks WHO performed the action, FROM WHERE, and WHAT the action was.
 *
 * @param req - Express request object
 * @param originAction - Action identifier in UPPER_SNAKE_CASE (e.g. 'EXAMPLE_CREATE')
 * @param traceId - Optional trace ID override (falls back to x-trace-id header or new UUID)
 * @param ignoredFields - Prisma model fields to exclude from audit diff logging
 */
export const createAuditContext = (
  req: Request,
  originAction?: string,
  traceId?: string,
  ignoredFields?: string[]
): AuditContext => {
  // Extract operator from authentication headers
  const userIdHeader = req.headers['x-jwt-user'] as string | undefined
  const operatorId = userIdHeader || req.requestingUser?.userId || 'anonymous'

  // Extract or generate trace ID (priority: parameter > header > new UUID)
  const headerTraceId = req.headers['x-trace-id'] as string | undefined
  const finalTraceId = traceId || headerTraceId || new UUIDv7().value

  // Extract origin action from header if not provided as parameter
  const headerOriginAction = req.headers['x-origin-action'] as string | undefined
  const finalOriginAction = originAction || headerOriginAction

  // Extract client IP (prefer forwarded header for requests behind a proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for']
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded
  const ipRequest: string | undefined = forwardedValue
    ? forwardedValue.split(',')[0]?.trim()
    : req.socket?.remoteAddress

  return {
    operator: new ExternalId(operatorId),
    ipRequest,
    traceId: finalTraceId,
    originAction: finalOriginAction,
    ignoredFields: ignoredFields || ['updated_at']
  }
}
