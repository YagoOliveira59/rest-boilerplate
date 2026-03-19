import { Prisma } from '@prisma/client'

import { AuditContext } from '@/infra/database/prisma/helpers/audit.interfaces'

/**
 * Unit of Work pattern interface for managing database transactions with audit context.
 *
 * All write operations that need to be audited must go through this interface.
 * The implementation (PrismaTransactionWrapper) injects audit context into PostgreSQL
 * session variables so that database triggers can log changes automatically.
 *
 * @example
 * ```typescript
 * await this.unitOfWork.run(
 *   { operator: userId, traceId: 'req-123' },
 *   async (tx) => {
 *     return await tx.example.create({ data: {...} })
 *   }
 * )
 * ```
 */
export interface IUnitOfWork<T extends Prisma.TransactionClient> {
  run<R>(context: AuditContext, callback: (transaction: T) => Promise<R>): Promise<R>
}
