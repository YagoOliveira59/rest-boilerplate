export class AuthValidationDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthValidationDataError'
  }
}

export class AuthCheckError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthCheckError'
  }
}
