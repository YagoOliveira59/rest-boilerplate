import { Prisma, PrismaClient } from '@prisma/client'
import { inject, singleton } from 'tsyringe'

import Example from '@/core/domain/example/entity/example'
import { ExampleFilters, IExampleRepository } from '@/core/domain/example/repository/example.repository.interfaces'
import UUIDv7 from '@/core/domain/value-objects/uuid/uuid'

import PrismaClientProvider from '@/infra/database/prisma/client.prisma'
import { AuditContext } from '@/infra/database/prisma/helpers/audit.interfaces'
import * as unitOfWorkPort from '@/infra/database/prisma/helpers/unit-of-work.port'
import ExampleRepositoryMapper from '@/infra/database/repositories/example/example.repository.mapper'

/**
 * Prisma implementation of IExampleRepository.
 *
 * TODO:
 *  - Update all model references from `example` to your Prisma model name
 *  - Add/remove query methods as your domain requires
 *  - Adjust `include` clauses for relations
 */
@singleton()
export default class ExampleRepository implements IExampleRepository {
  private readonly prisma: PrismaClient

  constructor(
    @inject(PrismaClientProvider) private readonly prismaProvider: PrismaClientProvider,
    @inject(ExampleRepositoryMapper) private readonly mapper: ExampleRepositoryMapper,
    @inject('IUnitOfWork') private readonly unitOfWork: unitOfWorkPort.IUnitOfWork<Prisma.TransactionClient>
  ) {
    this.prisma = this.prismaProvider.client
  }

  public async findById(id: UUIDv7): Promise<Example | null> {
    // TODO: Update `this.prisma.example` to your model name (e.g., this.prisma.product)
    const data = await this.prisma.example.findUnique({ where: { id: id.value } })

    if (!data) return null

    return this.mapper.toDomain(data)
  }

  public async findAll(filters?: ExampleFilters): Promise<Example[]> {
    const where: Prisma.ExampleWhereInput = {}

    if (filters?.active !== undefined) {
      where.active = filters.active
    }

    const data = await this.prisma.example.findMany({
      where,
      orderBy: { created_at: 'desc' }
    })

    return this.mapper.toDomainArray(data)
  }

  public async create(example: Example, auditContext: AuditContext): Promise<void> {
    await this.unitOfWork.run(auditContext, async (tx) => {
      await tx.example.create({
        data: {
          id: example.id.value,
          name: example.name,
          description: example.description,
          active: example.active,
          created_at: example.createdAt,
          updated_at: example.updatedAt
        }
      })
    })
  }

  public async update(example: Example, auditContext: AuditContext): Promise<void> {
    await this.unitOfWork.run(auditContext, async (tx) => {
      await tx.example.update({
        where: { id: example.id.value },
        data: {
          name: example.name,
          description: example.description,
          active: example.active,
          updated_at: example.updatedAt
        }
      })
    })
  }

  public async updateStatus(example: Example, auditContext: AuditContext): Promise<void> {
    await this.unitOfWork.run(auditContext, async (tx) => {
      await tx.example.update({
        where: { id: example.id.value },
        data: {
          active: example.active,
          updated_at: example.updatedAt
        }
      })
    })
  }
}
