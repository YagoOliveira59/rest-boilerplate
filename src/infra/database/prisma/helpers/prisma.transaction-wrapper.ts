import { PrismaClient } from '@prisma/client'
import { inject, singleton } from 'tsyringe'

import PrismaClientProvider from '@/infra/database/prisma/client.prisma'
import { AuditContextSchema } from '@/infra/database/prisma/helpers/audit-context.validator'
import { AuditContext } from '@/infra/database/prisma/helpers/audit.interfaces'
import { IUnitOfWork } from '@/infra/database/prisma/helpers/unit-of-work.port'

import LoggerConfig from '@/main/config/logger.config'

/**
 * Type representing a Prisma client within a transaction context.
 */
type TransactionalClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

/**
 * Critical fields that cannot be excluded from audit logging.
 */
const CRITICAL_AUDIT_FIELDS = ['id', 'created_at']

/**
 * Prisma Transaction Wrapper — implements the Unit of Work pattern.
 *
 * Features:
 * - Injects audit context into PostgreSQL session via set_audit_context()
 * - Deadlock detection + retry with exponential backoff
 * - Zod validation of audit context before execution
 * - Protection of critical audit fields (id, created_at)
 *
 * IMPORTANT: This requires the `set_audit_context` PostgreSQL function and
 * audit trigger to be installed in your database.
 * If you don't need audit trails, simplify this to a plain $transaction wrapper.
 */
@singleton()
export default class PrismaTransactionWrapper implements IUnitOfWork<TransactionalClient> {
  private readonly prisma: PrismaClient
  private readonly MAX_RETRIES = 3
  private readonly INITIAL_RETRY_DELAY_MS = 100

  constructor(
    @inject(LoggerConfig) private readonly loggerConfig: LoggerConfig,
    @inject(PrismaClientProvider) private readonly prismaProvider: PrismaClientProvider
  ) {
    this.prisma = this.prismaProvider.client
  }

  public async run<T>(context: AuditContext, callback: (tx: TransactionalClient) => Promise<T>): Promise<T> {
    const { structured } = this.loggerConfig
    const validatedContext = AuditContextSchema.parse(context)

    let lastError: unknown

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        structured.debug('Initializing transaction', {
          operation: 'db.transaction.init',
          operatorId: validatedContext.operator.value,
          attempt
        })

        return await this.executeTransaction(validatedContext, callback)
      } catch (error) {
        lastError = error

        if (this.isDeadlockError(error)) {
          const isLastAttempt = attempt === this.MAX_RETRIES

          structured.warn('Deadlock detected in transaction', {
            operation: 'db.transaction.deadlock',
            operatorId: validatedContext.operator.value,
            attempt,
            willRetry: !isLastAttempt
          })

          if (!isLastAttempt) {
            await this.sleep(this.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1))
            continue
          }
        }

        if (attempt === this.MAX_RETRIES) {
          structured.error('Transaction failed after all retries', error as Error, {
            operation: 'db.transaction.failed',
            operatorId: validatedContext.operator.value
          })
        }

        throw error
      }
    }

    throw lastError
  }

  private async executeTransaction<T>(
    context: AuditContext,
    callback: (tx: TransactionalClient) => Promise<T>
  ): Promise<T> {
    const { structured } = this.loggerConfig

    return this.prisma.$transaction(async (tx) => {
      const sanitizedIgnoredFields = this.sanitizeIgnoredFields(context.ignoredFields)

      // Inject audit context into PostgreSQL session for trigger-based audit logging.
      // TODO: Remove or replace this if you're using a different audit mechanism.
      await tx.$executeRaw`
        SELECT set_audit_context(
          ${context.operator.value},
          ${context.ipRequest ?? null},
          ${context.traceId ?? null},
          ${context.originAction ?? null},
          ${sanitizedIgnoredFields}
        )
      `

      structured.debug('Audit context set', {
        operation: 'db.audit.set',
        operatorId: context.operator.value
      })

      const result = await callback(tx)

      structured.dbOperation('Transaction completed', {
        operatorId: context.operator.value,
        dbOperation: 'transaction'
      })

      return result
    })
  }

  private isDeadlockError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('deadlock detected') || error.message.includes('40P01')
    }
    return false
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private sanitizeIgnoredFields(fields?: string[]): string | null {
    const { structured } = this.loggerConfig
    if (!fields || fields.length === 0) return null

    const VALID_FIELD_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/

    const validFields = (fields ?? [])
      .map((f) => f.trim())
      .filter((field) => {
        if (!field) return false

        if (!VALID_FIELD_NAME_REGEX.test(field)) {
          structured.warn('Invalid field name format in ignoredFields (possible SQL injection)', {
            field,
            operation: 'db.audit.validate_field'
          })
          return false
        }

        if (CRITICAL_AUDIT_FIELDS.includes(field.toLowerCase())) {
          structured.warn('Attempted to ignore critical audit field — denied', {
            field,
            operation: 'db.audit.validate_field'
          })
          return false
        }

        return true
      })

    return validFields.length > 0 ? validFields.join(',') : null
  }
}
