import { uuidv7 } from 'uuidv7'

import TextValidator from '@/core/validators/text-validator/text-validator'

/** Value object wrapping a UUIDv7 string with format validation */
export default class UUIDv7 {
  private readonly _value: string

  constructor(value?: string) {
    if (value === undefined) {
      this._value = uuidv7()
      return
    }

    this.validate(value)
    this._value = value
  }

  private validate(value: string): void {
    TextValidator.validate(value, [
      TextValidator.required('UUIDv7 is required'),
      TextValidator.pattern(
        /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i,
        'Invalid UUIDv7 format'
      )
    ])
  }

  public get value(): string {
    return this._value
  }
}
