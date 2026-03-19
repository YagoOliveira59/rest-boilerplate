import { singleton } from 'tsyringe'

import Example from '@/core/domain/example/entity/example'
import UUIDv7 from '@/core/domain/value-objects/uuid/uuid'

// TODO: Update the Prisma model type to match your generated schema
// Import the correct type from @prisma/client once you run `pnpm prisma:generate`
type PrismaExample = {
  id: string
  name: string
  description: string | null
  active: boolean
  created_at: Date
  updated_at: Date
}

/**
 * Maps between Prisma database rows and domain entities.
 *
 * TODO: Update toDomain() to handle all fields from your Prisma model
 * and add any relation mappings (e.g., nested includes).
 */
@singleton()
export default class ExampleRepositoryMapper {
  public toDomain(data: PrismaExample): Example {
    return new Example({
      id: new UUIDv7(data.id),
      name: data.name,
      description: data.description ?? undefined,
      active: data.active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    })
  }

  public toDomainArray(data: PrismaExample[]): Example[] {
    return data.map((item) => this.toDomain(item))
  }
}
