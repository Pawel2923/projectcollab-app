import { describe, it, expect } from "vitest"
import {
  createAuthValidationError,
  createEmailRequiredError,
  createEmailVerificationError,
  createInvalidCredentialsError,
  createSessionExpiredError,
  createTooManyRequestsError,
  createUserAlreadyExistsError,
  isAuthError,
} from "./auth-error"

describe("auth-error factories and type guards", () => {
  it("creates frozen domain error objects with expected kind and default messages", () => {
    const sessionExpired = createSessionExpiredError()
    const invalidCredentials = createInvalidCredentialsError()
    const userExists = createUserAlreadyExistsError()
    const tooManyRequests = createTooManyRequestsError()
    const emailRequired = createEmailRequiredError()
    const invalidLink = createEmailVerificationError("invalid_link")
    const userNotFound = createEmailVerificationError("user_not_found")
    const verificationFailed = createEmailVerificationError(
      "verification_failed"
    )

    expect(sessionExpired).toEqual({
      kind: "session_expired",
      message: "Session expired",
    })
    expect(invalidCredentials).toEqual({
      kind: "invalid_credentials",
      message: "Invalid credentials",
    })
    expect(userExists).toEqual({
      kind: "user_already_exists",
      message: "User with this email already exists",
    })
    expect(tooManyRequests).toEqual({
      kind: "too_many_requests",
      message: "Too many requests",
    })
    expect(emailRequired).toEqual({
      kind: "email_required",
      message: "Email is required",
    })
    expect(invalidLink).toEqual({
      kind: "invalid_link",
      message: "Invalid email verification link",
    })
    expect(userNotFound).toEqual({
      kind: "user_not_found",
      message: "User not found",
    })
    expect(verificationFailed).toEqual({
      kind: "verification_failed",
      message: "Email verification failed",
    })

    for (const err of [
      sessionExpired,
      invalidCredentials,
      userExists,
      tooManyRequests,
      emailRequired,
      invalidLink,
      userNotFound,
      verificationFailed,
    ]) {
      expect(Object.isFrozen(err)).toBe(true)
      expect(isAuthError(err)).toBe(true)
    }
  })

  it("creates frozen AuthValidationError with deeply frozen violations", () => {
    const validationError = createAuthValidationError([
      {
        propertyPath: "plainPassword",
        message: "Password is compromised",
        code: "code-123",
      },
      {
        propertyPath: "email",
        message: "Invalid email",
      },
    ])

    expect(validationError).toEqual({
      kind: "validation_error",
      message: "Validation failed",
      violations: [
        {
          propertyPath: "plainPassword",
          message: "Password is compromised",
          code: "code-123",
        },
        {
          propertyPath: "email",
          message: "Invalid email",
        },
      ],
    })
    expect(Object.isFrozen(validationError)).toBe(true)
    expect(Object.isFrozen(validationError.violations)).toBe(true)
    expect(Object.isFrozen(validationError.violations[0])).toBe(true)
    expect(isAuthError(validationError)).toBe(true)
  })

  it("rejects non-auth error values in isAuthError", () => {
    expect(isAuthError(new Error("Boom"))).toBe(false)
    expect(isAuthError(null)).toBe(false)
    expect(isAuthError(undefined)).toBe(false)
    expect(isAuthError({ kind: "unknown_kind", message: "test" })).toBe(false)
    expect(isAuthError({ kind: "validation_error", message: "no array" })).toBe(
      false
    )
  })
})
