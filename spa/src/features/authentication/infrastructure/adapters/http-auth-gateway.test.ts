import { describe, it, expect, vi, beforeEach } from "vitest"
import { HttpAuthGateway } from "./http-auth-gateway"
import {
  InvalidCredentialsError,
  TooManyRequestsError,
  UserAlreadyExistsError,
} from "../../domain/errors/auth-error"
import { ApiError, SYMFONY_VIOLATION_CODES } from "@/shared/api"
import type { AppLocale } from "@/shared/i18n"
import type { ApiUserDto } from "../dto/user-api.dto"
import type {
  apiClient,
  apiFetch,
  refreshTokens,
  onAuthFailure,
} from "@/shared/api"

describe("HttpAuthGateway", () => {
  let mockApiClient: {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
  }
  let mockApiFetch: ReturnType<typeof vi.fn>
  let mockRefreshTokens: ReturnType<typeof vi.fn>
  let mockOnAuthFailure: ReturnType<typeof vi.fn>
  let mockGetLocale: ReturnType<typeof vi.fn<() => AppLocale>>
  let gateway: HttpAuthGateway

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
    }
    mockApiFetch = vi.fn()
    mockRefreshTokens = vi.fn()
    mockOnAuthFailure = vi.fn()
    mockGetLocale = vi.fn<() => AppLocale>(() => "pl")

    gateway = new HttpAuthGateway({
      apiClient: mockApiClient as unknown as typeof apiClient,
      apiFetch: mockApiFetch as unknown as typeof apiFetch,
      refreshTokens: mockRefreshTokens as unknown as typeof refreshTokens,
      onAuthFailure: mockOnAuthFailure as unknown as typeof onAuthFailure,
      getLocale: mockGetLocale,
    })
  })

  it("calls login endpoint with correct credentials and options", async () => {
    mockApiFetch.mockResolvedValueOnce({})

    await gateway.login({ email: "user@test.com", password: "password123" })

    expect(mockApiFetch).toHaveBeenCalledWith("/core-api/auth/login", {
      method: "POST",
      body: { email: "user@test.com", password: "password123" },
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
  })

  it("throws InvalidCredentialsError when login returns 401 ApiError", async () => {
    mockApiFetch.mockRejectedValueOnce(
      new ApiError(401, { message: "Invalid credentials." })
    )

    await expect(
      gateway.login({ email: "user@test.com", password: "wrong-password" })
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it("does not store tokens locally — cookies are managed by the server", async () => {
    // Login response body still contains tokens (additive / backward compat)
    // but the gateway does not capture them in JS memory.
    mockApiFetch.mockResolvedValueOnce({
      token: "jwt-token-123",
      refresh_token: "refresh-token-abc",
    })

    await gateway.login({ email: "user@test.com", password: "password123" })

    // No side-effect: a subsequent logout sends no body token.
    mockApiFetch.mockResolvedValueOnce(null)
    await gateway.logout()

    expect(mockApiFetch).toHaveBeenLastCalledWith("/core-api/auth/logout", {
      method: "POST",
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
  })

  it("calls logout endpoint with no body — relies on refresh_token cookie", async () => {
    mockApiFetch.mockResolvedValueOnce(null)

    await gateway.logout()

    expect(mockApiFetch).toHaveBeenCalledWith("/core-api/auth/logout", {
      method: "POST",
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
  })

  it("resolves gracefully when logout endpoint fails", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"))

    await expect(gateway.logout()).resolves.toBeUndefined()
  })

  it("fetches and maps current user to domain entity", async () => {
    const rawUser: ApiUserDto = {
      "@id": "/core-api/users/99",
      "@type": "User",
      id: 99,
      email: "user@test.com",
      roles: ["ROLE_USER"],
      username: "user99",
    }
    mockApiClient.get.mockResolvedValueOnce(rawUser)

    const result = await gateway.getCurrentUser()

    expect(mockApiClient.get).toHaveBeenCalledWith("/core-api/users/me", {
      skipAuthRedirect: true,
    })
    expect(result).toEqual({
      id: 99,
      email: "user@test.com",
      roles: ["ROLE_USER"],
      username: "user99",
      registeredAt: undefined,
      isVerified: undefined,
    })
  })

  it("returns null when getCurrentUser fails with an error", async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error("Unauthorized"))

    const result = await gateway.getCurrentUser()
    expect(result).toBeNull()
  })

  it("delegates refreshTokens with no arguments — cookie is automatic", async () => {
    mockRefreshTokens.mockResolvedValueOnce(true)

    const refreshed = await gateway.refreshTokens()

    expect(refreshed).toBe(true)
    expect(mockRefreshTokens).toHaveBeenCalledWith()
  })

  it("delegates onAuthFailure callback registration", async () => {
    const cb = vi.fn()
    gateway.onAuthFailure(cb)
    expect(mockOnAuthFailure).toHaveBeenCalledWith(cb)
  })

  it("calls signUp endpoint with JSON-LD content type, plainPassword, and current locale payload", async () => {
    mockGetLocale.mockReturnValueOnce("en")
    mockApiFetch.mockResolvedValueOnce({})

    await gateway.signUp({ email: "new@test.com", password: "password123" })

    expect(mockApiFetch).toHaveBeenCalledWith("/core-api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
      },
      body: {
        email: "new@test.com",
        plainPassword: "password123",
        locale: "en",
      },
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
  })

  it("throws UserAlreadyExistsError when signUp returns 422 with email violation", async () => {
    mockApiFetch.mockRejectedValueOnce(
      new ApiError(422, {
        violations: [
          {
            propertyPath: "email",
            message: "User with this email already exists",
          },
        ],
      })
    )

    await expect(
      gateway.signUp({ email: "existing@test.com", password: "password123" })
    ).rejects.toThrow(UserAlreadyExistsError)
  })

  it("throws UserAlreadyExistsError when signUp returns 422 with UniqueEntity code and generic message", async () => {
    mockApiFetch.mockRejectedValueOnce(
      new ApiError(422, {
        violations: [
          {
            propertyPath: "email",
            message: "This value is already used.",
            code: SYMFONY_VIOLATION_CODES.UNIQUE_ENTITY_NOT_UNIQUE,
          },
        ],
      })
    )

    await expect(
      gateway.signUp({ email: "existing@test.com", password: "password123" })
    ).rejects.toThrow(UserAlreadyExistsError)
  })

  it("propagates non-email ApiError from signUp", async () => {
    const apiError = new ApiError(422, {
      violations: [
        {
          propertyPath: "plainPassword",
          message: "This password has been leaked in a data breach.",
        },
      ],
    })
    mockApiFetch.mockRejectedValueOnce(apiError)

    await expect(
      gateway.signUp({ email: "new@test.com", password: "password" })
    ).rejects.toThrow(apiError)
  })

  it("calls verify-email/send endpoint with JSON-LD content type, email, and current locale payload", async () => {
    mockGetLocale.mockReturnValueOnce("en")
    mockApiFetch.mockResolvedValueOnce({ code: "VERIFY_EMAIL_SENT" })

    await gateway.resendVerificationEmail("user@test.com")

    expect(mockApiFetch).toHaveBeenCalledWith("/core-api/verify-email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
      },
      body: { email: "user@test.com", locale: "en" },
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
  })

  it("throws TooManyRequestsError when resendVerificationEmail returns 429 ApiError", async () => {
    mockApiFetch.mockRejectedValueOnce(
      new ApiError(429, { detail: "Too many requests" })
    )

    await expect(
      gateway.resendVerificationEmail("user@test.com")
    ).rejects.toThrow(TooManyRequestsError)
  })

  it("propagates 422 ApiError from resendVerificationEmail", async () => {
    const apiError = new ApiError(422, {
      violations: [
        {
          propertyPath: "email",
          message: "This value is not a valid email address.",
          code: SYMFONY_VIOLATION_CODES.EMAIL_INVALID_FORMAT,
        },
      ],
    })
    mockApiFetch.mockRejectedValueOnce(apiError)

    await expect(
      gateway.resendVerificationEmail("invalid-email")
    ).rejects.toThrow(apiError)
  })

  it("calls verify-email POST endpoint with query params and maps verified response", async () => {
    mockApiFetch.mockResolvedValueOnce({
      code: "EMAIL_VERIFIED",
      isVerified: true,
    })

    const result = await gateway.verifyEmail({
      id: "42",
      expires: "1799999999",
      signature: "sig+abc=",
      token: "tok/xyz",
    })

    expect(result).toEqual({ status: "verified" })
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/core-api/verify-email?expires=1799999999&id=42&signature=sig%2Babc%3D&token=tok%2Fxyz",
      {
        method: "POST",
        skipAuthRefresh: true,
        skipAuthRedirect: true,
      }
    )
  })

  it("maps USER_NOT_FOUND verify-email response to user_not_found result", async () => {
    mockApiFetch.mockResolvedValueOnce({
      code: "USER_NOT_FOUND",
      isVerified: false,
    })

    const result = await gateway.verifyEmail({
      id: "999",
      expires: "1799999999",
      signature: "sig",
      token: "tok",
    })

    expect(result).toEqual({ status: "failed", reason: "user_not_found" })
  })

  it("maps verify-email ApiError and network failures into EmailVerificationResult", async () => {
    mockApiFetch.mockRejectedValueOnce(
      new ApiError(422, { detail: "Missing param" })
    )

    await expect(
      gateway.verifyEmail({
        id: "42",
        expires: "1799999999",
        signature: "sig",
        token: "tok",
      })
    ).resolves.toEqual({ status: "failed", reason: "invalid_link" })

    mockApiFetch.mockRejectedValueOnce(new Error("Network error"))

    await expect(
      gateway.verifyEmail({
        id: "42",
        expires: "1799999999",
        signature: "sig",
        token: "tok",
      })
    ).resolves.toEqual({ status: "failed", reason: "server_error" })
  })
})
