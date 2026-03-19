import { ExampleInactiveError, ExampleValidationError } from '@/core/domain/example/entity/example.errors'
import { ExampleProps, IExample } from '@/core/domain/example/entity/example.interfaces'
import UUIDv7 from '@/core/domain/value-objects/uuid/uuid'
import TextValidator from '@/core/validators/text-validator/text-validator'

/**
 * Example domain entity.
 *
 * This is a template entity — replace "Example" with your domain concept (Order, Product, etc.)
 * and update the properties, validation rules, and business methods accordingly.
 *
 * Conventions:
 *  - Private backing fields with underscore prefix (_name)
 *  - Public getters expose immutable copies (dates are cloned, arrays are spread)
 *  - Mutation methods validate before changing state
 *  - Throw domain errors (ExampleValidationError) — NOT HTTP errors
 *  - Immutable fields (id, createdAt) are set only in the constructor
 */
export default class Example implements IExample {
  // Immutable properties
  private readonly _id: UUIDv7
  private readonly _createdAt: Date

  // Mutable properties
  private _name: string
  private _description: string | null
  private _active: boolean
  private _updatedAt: Date

  constructor(props: ExampleProps, now: Date = new Date()) {
    this.validate(props)

    this._id = props.id
    this._name = props.name
    this._description = props.description ?? null
    this._active = props.active ?? true
    this._createdAt = props.createdAt ?? now
    this._updatedAt = props.updatedAt ?? now
  }

  // ─── Validation ──────────────────────────────────────────────────────────────

  private validate(props: ExampleProps): void {
    this.validateName(props.name)
    if (props.description) this.validateDescription(props.description)
  }

  private validateName(name: string): void {
    TextValidator.validate(name, [
      TextValidator.required('Example name is required'),
      TextValidator.maxLength(255, 'Example name must have at most 255 characters')
    ])
  }

  private validateDescription(description: string): void {
    TextValidator.validate(description, [
      TextValidator.maxLength(1000, 'Example description must have at most 1000 characters')
    ])
  }

  // ─── Public Mutation Methods ──────────────────────────────────────────────────

  public updateName(name: string, now: Date = new Date()): void {
    if (!this._active) throw new ExampleInactiveError({ exampleId: this._id.value })
    this.validateName(name)
    this._name = name
    this._updatedAt = now
  }

  public updateDescription(description: string | null, now: Date = new Date()): void {
    if (!this._active) throw new ExampleInactiveError({ exampleId: this._id.value })
    if (description !== null) this.validateDescription(description)
    this._description = description
    this._updatedAt = now
  }

  public updateActive(active: boolean, now: Date = new Date()): void {
    this._active = active
    this._updatedAt = now
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  public get id(): UUIDv7 {
    return this._id
  }

  public get name(): string {
    return this._name
  }

  public get description(): string | null {
    return this._description
  }

  public get active(): boolean {
    return this._active
  }

  public get createdAt(): Date {
    return new Date(this._createdAt.getTime())
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt.getTime())
  }
}
