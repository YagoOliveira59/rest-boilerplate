import { MONGODB_OBJECTID_REGEX } from '@/core/constants/regex.constants'
import TextValidator from '@/core/validators/text-validator/text-validator'

/**
 * Value object representing an external identifier (MongoDB ObjectId format).
 * Exactly 24 hexadecimal characters.
 *
 * Used for cross-service references (e.g., user IDs from another system).
 *
 * TODO: Replace with a different format if your external IDs differ (UUID, numeric, etc.)
 */
export default class ExternalId {
  private readonly _value: string

  constructor(value: string) {
    this.validate(value)
    this._value = value
  }

  private validate(value: string): void {
    TextValidator.validate(value, [
      TextValidator.required('External id is required'),
      TextValidator.pattern(MONGODB_OBJECTID_REGEX, 'Invalid external id format (expected 24-char hex)')
    ])
  }

  public get value(): string {
    return this._value
  }
}
