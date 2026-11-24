import { describe, it, expect, vi, beforeEach } from "vitest"
import { ResendVerificationEmailUseCase } from "./resend-verification-email.use-case"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { AuthError, TooManyRequestsError } from "../../domain/errors/auth-error"

describe("ResendVerificationEmailUseCase", () => {
  let mockGateway: {
    login: ReturnType<typeof vi.fn>
    signUp: ReturnType<typeof vi.fn>
    resendVerificationEmail: ReturnType<typeof vi.fn>
    logout: ReturnType<typeof vi.fn>
    getCurrentUser: ReturnType<typeof vi.fn>
    refreshTokens: ReturnType<typeof vi.fn>
    onAuthFailure: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockGateway = {
      login: vi.fn(),
      signUp: vi.fn(),
      resendVerificationEmail: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshTokens: vi.fn(),
      onAuthFailure: vi.fn(),
    }
  })

  it("trims and passes valid email to gateway.resendVerificationEmail", async () => {
    const useCase = new ResendVerificationEmailUseCase(
      mockGateway as unknown as AuthGatewayPort
    )

    await useCase.execute("  user@example.com  ")

    expect(mockGateway.resendVerificationEmail).toHaveBeenCalledTimes(1)
    expect(mockGateway.resendVerificationEmail).toHaveBeenCalledWith(
      "user@example.com"
    )
  })

  it("throws AuthError and does not call gateway when email is empty or whitespace-only", async () => {
    const useCase = new ResendVerificationEmailUseCase(
      mockGateway as unknown as AuthGatewayPort
    )

    await expect(useCase.execute("")).rejects.toThrow(AuthError)
    await expect(useCase.execute("   ")).rejects.toThrow(AuthError)
    expect(mockGateway.resendVerificationEmail).not.toHaveBeenCalled()
  })

  it("propagates TooManyRequestsError and other gateway errors", async () => {
    mockGateway.resendVerificationEmail.mockRejectedValueOnce(
      new TooManyRequestsError()
    )
    const useCase = new ResendVerificationEmailUseCase(
      mockGateway as unknown as AuthGatewayPort
    )

    await expect(useCase.execute("user@example.com")).rejects.toThrow(
      TooManyRequestsError
    )
  })
})
