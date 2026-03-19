import { IExample } from '@/core/domain/example/entity/example.interfaces'
import UUIDv7 from '@/core/domain/value-objects/uuid/uuid'

import { AuditContext } from '@/infra/database/prisma/helpers/audit.interfaces'

// TODO: Add or remove filter/search fields to match your entity's query requirements

export interface ExampleFilters {
  active?: boolean
}

/**
 * Repository interface for the Example entity.
 *
 * Defined in the core layer (domain) — implementation lives in infra/database/repositories.
 * Use cases depend on this interface (not the concrete class) for testability.
 *
 * TODO: Add findByName, findByExternalId, or other lookups your domain needs
 */
export interface IExampleRepository {
  findById(id: UUIDv7): Promise<IExample | null>
  findAll(filters?: ExampleFilters): Promise<IExample[]>
  create(example: IExample, auditContext: AuditContext): Promise<void>
  update(example: IExample, auditContext: AuditContext): Promise<void>
  updateStatus(example: IExample, auditContext: AuditContext): Promise<void>
}
