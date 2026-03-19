import { faker } from '@faker-js/faker'

import Example from '@/core/domain/example/entity/example'
import UUIDv7 from '@/core/domain/value-objects/uuid/uuid'

/**
 * Test data builder for the Example entity.
 *
 * Uses the Builder pattern with sensible defaults backed by @faker-js/faker.
 * Override individual fields by calling the corresponding setter.
 *
 * TODO: Add setters for each field your entity has.
 *
 * @example
 * const example = new ExampleBuilder().withName('My Example').build()
 * const inactive = new ExampleBuilder().inactive().build()
 */
export class ExampleBuilder {
  private id: UUIDv7 = new UUIDv7()
  private name: string = faker.commerce.productName()
  private description: string | undefined = faker.lorem.sentence()
  private active: boolean = true
  private createdAt: Date = new Date()
  private updatedAt: Date = new Date()

  withId(id: string): this {
    this.id = new UUIDv7(id)
    return this
  }

  withName(name: string): this {
    this.name = name
    return this
  }

  withDescription(description: string | undefined): this {
    this.description = description
    return this
  }

  inactive(): this {
    this.active = false
    return this
  }

  build(): Example {
    return new Example({
      id: this.id,
      name: this.name,
      description: this.description,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    })
  }
}
