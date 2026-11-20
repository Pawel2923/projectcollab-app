export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthError"
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message: string = "Session expired") {
    super(message)
    this.name = "SessionExpiredError"
  }
}
