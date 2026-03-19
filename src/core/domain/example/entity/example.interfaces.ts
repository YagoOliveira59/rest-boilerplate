import UUIDv7 from '@/core/domain/value-objects/uuid/uuid'

// TODO: Replace these props and interface with your domain entity's actual fields

export interface ExampleProps {
  id: UUIDv7
  name: string
  description?: string | undefined
  active?: boolean | undefined
  createdAt?: Date | undefined
  updatedAt?: Date | undefined
}

export interface IExample {
  readonly id: UUIDv7
  readonly createdAt: Date

  name: string
  description: string | null
  active: boolean
  updatedAt: Date

  updateName(name: string, now?: Date): void
  updateDescription(description: string | null, now?: Date): void
  updateActive(active: boolean, now?: Date): void
}
