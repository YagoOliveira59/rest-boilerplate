import Example from '@/core/domain/example/entity/example'
import { ExampleInactiveError } from '@/core/domain/example/entity/example.errors'
import UUIDv7 from '@/core/domain/value-objects/uuid/uuid'
import { CoreValidationError } from '@/core/errors/core.errors'

import { ExampleBuilder } from '@/tests/shared/builders/example.builder'

/**
 * Unit tests for the Example entity.
 *
 * Test the domain logic in isolation — no database, no HTTP.
 * TODO: Add tests for every domain rule in your entity.
 */
describe('Example Entity', () => {
  describe('constructor', () => {
    it('should create a valid example with required fields', () => {
      const example = new ExampleBuilder().build()

      expect(example.id).toBeInstanceOf(UUIDv7)
      expect(example.name).toBeDefined()
      expect(example.active).toBe(true)
      expect(example.createdAt).toBeInstanceOf(Date)
      expect(example.updatedAt).toBeInstanceOf(Date)
    })

    it('should default active to true when not provided', () => {
      const example = new Example({ id: new UUIDv7(), name: 'Test Example' })

      expect(example.active).toBe(true)
    })

    it('should throw CoreValidationError when name is empty', () => {
      expect(() => new Example({ id: new UUIDv7(), name: '' })).toThrow(CoreValidationError)
    })

    it('should throw CoreValidationError when name exceeds 255 characters', () => {
      expect(() => new Example({ id: new UUIDv7(), name: 'a'.repeat(256) })).toThrow(CoreValidationError)
    })
  })

  describe('updateName', () => {
    it('should update the name successfully', () => {
      const example = new ExampleBuilder().build()
      const newName = 'Updated Name'

      example.updateName(newName)

      expect(example.name).toBe(newName)
    })

    it('should throw ExampleInactiveError when example is inactive', () => {
      const example = new ExampleBuilder().inactive().build()

      expect(() => example.updateName('New Name')).toThrow(ExampleInactiveError)
    })

    it('should update updatedAt timestamp', () => {
      const example = new ExampleBuilder().build()
      const before = example.updatedAt

      // Advance time slightly
      const later = new Date(before.getTime() + 1000)
      example.updateName('New Name', later)

      expect(example.updatedAt.getTime()).toBe(later.getTime())
    })
  })

  describe('updateActive', () => {
    it('should deactivate the example', () => {
      const example = new ExampleBuilder().build()

      example.updateActive(false)

      expect(example.active).toBe(false)
    })

    it('should reactivate a previously inactive example', () => {
      const example = new ExampleBuilder().inactive().build()

      example.updateActive(true)

      expect(example.active).toBe(true)
    })
  })

  describe('immutability', () => {
    it('should return cloned Date objects from createdAt and updatedAt', () => {
      const example = new ExampleBuilder().build()

      const createdAt = example.createdAt
      createdAt.setFullYear(2000)

      expect(example.createdAt.getFullYear()).not.toBe(2000)
    })
  })
})
