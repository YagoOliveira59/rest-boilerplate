import { CoreValidationError } from '@/core/errors/core.errors'

type TextValidationRule = (value: string) => void

/**
 * Utility for composable text validation rules.
 * Combine multiple rules and call TextValidator.validate() to execute all at once.
 *
 * @example
 * TextValidator.validate(name, [
 *   TextValidator.required('Name is required'),
 *   TextValidator.maxLength(255, 'Name too long')
 * ])
 */
export default class TextValidator {
  static validate(value: string, rules: TextValidationRule[]): void {
    for (const rule of rules) {
      rule(value)
    }
  }

  static required(message: string): TextValidationRule {
    return (value: string) => {
      if (!value || value.trim().length === 0) {
        throw new CoreValidationError(message)
      }
    }
  }

  static minLength(min: number, message: string): TextValidationRule {
    return (value: string) => {
      if (value.length < min) {
        throw new CoreValidationError(message)
      }
    }
  }

  static maxLength(max: number, message: string): TextValidationRule {
    return (value: string) => {
      if (value.length > max) {
        throw new CoreValidationError(message)
      }
    }
  }

  static pattern(regex: RegExp, message: string): TextValidationRule {
    return (value: string) => {
      if (!regex.test(value)) {
        throw new CoreValidationError(message)
      }
    }
  }

  static lowerCamelCase(message: string): TextValidationRule {
    return TextValidator.pattern(/^[a-z][a-zA-Z0-9]*$/, message)
  }
}
