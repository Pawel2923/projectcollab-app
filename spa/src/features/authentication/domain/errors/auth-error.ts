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

export class InvalidCredentialsError extends AuthError {
  constructor(message: string = "Invalid credentials") {
    super(message)
    this.name = "InvalidCredentialsError"
  }
}

export class UserAlreadyExistsError extends AuthError {
  constructor(message: string = "User with this email already exists") {
    super(message)
    this.name = "UserAlreadyExistsError"
  }
}

export class TooManyRequestsError extends AuthError {
  constructor(message: string = "Too many requests") {
    super(message)
    this.name = "TooManyRequestsError"
  }
}
