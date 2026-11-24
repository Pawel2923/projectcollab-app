export interface AuthValidationViolation {
  readonly propertyPath: string
  readonly message: string
  readonly code?: string
}

export interface SessionExpiredError {
  readonly kind: "session_expired"
  readonly message: string
}

export interface InvalidCredentialsError {
  readonly kind: "invalid_credentials"
  readonly message: string
}

export interface UserAlreadyExistsError {
  readonly kind: "user_already_exists"
  readonly message: string
}

export interface TooManyRequestsError {
  readonly kind: "too_many_requests"
  readonly message: string
}

export interface EmailRequiredError {
  readonly kind: "email_required"
  readonly message: string
}

export interface AuthValidationError {
  readonly kind: "validation_error"
  readonly message: string
  readonly violations: readonly AuthValidationViolation[]
}

export type EmailVerificationErrorKind =
  "invalid_link" | "user_not_found" | "verification_failed"

export interface EmailVerificationError {
  readonly kind: EmailVerificationErrorKind
  readonly message: string
}

export type LoginError = InvalidCredentialsError

export type SignUpError =
  UserAlreadyExistsError | AuthValidationError | InvalidCredentialsError

export type ResendVerificationEmailError =
  EmailRequiredError | TooManyRequestsError | AuthValidationError

export type AuthError =
  | SessionExpiredError
  | InvalidCredentialsError
  | UserAlreadyExistsError
  | TooManyRequestsError
  | EmailRequiredError
  | AuthValidationError
  | EmailVerificationError

export type AuthErrorKind = AuthError["kind"]

const AUTH_ERROR_KINDS: ReadonlySet<string> = new Set<AuthErrorKind>([
  "session_expired",
  "invalid_credentials",
  "user_already_exists",
  "too_many_requests",
  "email_required",
  "validation_error",
  "invalid_link",
  "user_not_found",
  "verification_failed",
])

export function createSessionExpiredError(
  message: string = "Session expired"
): SessionExpiredError {
  return Object.freeze({
    kind: "session_expired",
    message,
  })
}

export function createInvalidCredentialsError(
  message: string = "Invalid credentials"
): InvalidCredentialsError {
  return Object.freeze({
    kind: "invalid_credentials",
    message,
  })
}

export function createUserAlreadyExistsError(
  message: string = "User with this email already exists"
): UserAlreadyExistsError {
  return Object.freeze({
    kind: "user_already_exists",
    message,
  })
}

export function createTooManyRequestsError(
  message: string = "Too many requests"
): TooManyRequestsError {
  return Object.freeze({
    kind: "too_many_requests",
    message,
  })
}

export function createEmailRequiredError(
  message: string = "Email is required"
): EmailRequiredError {
  return Object.freeze({
    kind: "email_required",
    message,
  })
}

export function createAuthValidationError(
  violations: readonly AuthValidationViolation[],
  message: string = "Validation failed"
): AuthValidationError {
  const frozenViolations = Object.freeze(
    violations.map((v) =>
      Object.freeze(
        v.code !== undefined
          ? {
              propertyPath: v.propertyPath,
              message: v.message,
              code: v.code,
            }
          : {
              propertyPath: v.propertyPath,
              message: v.message,
            }
      )
    )
  )

  return Object.freeze({
    kind: "validation_error",
    message,
    violations: frozenViolations,
  })
}

const DEFAULT_EMAIL_VERIFICATION_MESSAGES: Readonly<
  Record<EmailVerificationErrorKind, string>
> = {
  invalid_link: "Invalid email verification link",
  user_not_found: "User not found",
  verification_failed: "Email verification failed",
}

export function createEmailVerificationError(
  kind: EmailVerificationErrorKind,
  message: string = DEFAULT_EMAIL_VERIFICATION_MESSAGES[kind]
): EmailVerificationError {
  return Object.freeze({
    kind,
    message,
  })
}

export function isAuthError(value: unknown): value is AuthError {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const candidate = value as {
    kind?: unknown
    message?: unknown
    violations?: unknown
  }
  if (
    typeof candidate.kind !== "string" ||
    !AUTH_ERROR_KINDS.has(candidate.kind) ||
    typeof candidate.message !== "string"
  ) {
    return false
  }
  if (
    candidate.kind === "validation_error" &&
    !Array.isArray(candidate.violations)
  ) {
    return false
  }
  return true
}
