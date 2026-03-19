import z from 'zod'

import ExternalId from '@/core/domain/value-objects/external-id/external-id'

/**
 * Zod schema for validating AuditContext objects before they are used in transactions.
 * Ensures data integrity and prevents SQL injection via the ignoredFields array.
 */
export const AuditContextSchema = z.object({
  operator: z.instanceof(ExternalId, {
    message: 'Operator must be an instance of ExternalId.'
  }),
  ipRequest: z
    .ipv4({ message: 'IP address must be a valid IPv4 address.' })
    .or(z.ipv6({ message: 'IP address must be a valid IPv6 address.' }))
    .optional(),
  traceId: z
    .string()
    .regex(/^[a-zA-Z0-9-_]+$/, {
      message: 'Trace ID must contain only alphanumeric characters, hyphens, and underscores.'
    })
    .min(1, { message: 'Trace ID cannot be empty.' })
    .max(255, { message: 'Trace ID cannot exceed 255 characters.' })
    .optional(),
  originAction: z
    .string()
    .regex(/^[A-Z][A-Z0-9_]*$/, {
      message: 'Origin action must be in UPPER_SNAKE_CASE format (e.g., CREATE_EXAMPLE).'
    })
    .min(1, { message: 'Origin action cannot be empty.' })
    .max(100, { message: 'Origin action cannot exceed 100 characters.' })
    .optional(),
  ignoredFields: z
    .array(
      z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
        message: 'Field name must be a valid identifier.'
      })
    )
    .max(50, { message: 'Cannot ignore more than 50 fields at once.' })
    .optional()
})
