import { describe, it, expect, vi, beforeEach } from "vitest"
import { err, ok } from "@/shared/result"
import { ResendVerificationEmailUseCase } from "./resend-verification-email.use-case"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import {
  createEmailRequiredError,
  createTooManyRequestsError,
} from "../../domain/errors/auth-error"

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
      resendVerificationEmail: vi.fn().mockResolvedValue(ok()),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshTokens: vi.fn(),
      onAuthFailure: vi.fn(),
    }
  })

  it("trims and passes valid email to gateway.resendVerificationEmail and returns ok", async () => {
    const useCase = new ResendVerificationEmailUseCase(
      mockGateway as unknown as AuthGatewayPort
    )

    const result = await useCase.execute("  user@example.com  ")

    expect(result).toEqual(ok())
    expect(mockGateway.resendVerificationEmail).toHaveBeenCalledTimes(1)
    expect(mockGateway.resendVerificationEmail).toHaveBeenCalledWith(
      "user@example.com"
    )
  })

  it("returns EmailRequiredError result and does not call gateway when email is empty or whitespace-only", async () => {
    const useCase = new ResendVerificationEmailUseCase(
      mockGateway as unknown as AuthGatewayPort
    )

    await expect(useCase.execute("")).resolves.toEqual(
      err(createEmailRequiredError())
    )
    await expect(useCase.execute("   ")).resolves.toEqual(
      err(createEmailRequiredError())
    )
    expect(mockGateway.resendVerificationEmail).not.toHaveBeenCalled()
  })

  it("returns TooManyRequestsError result when gateway returns rate-limit err", async () => {
    const tooManyRequestsError = createTooManyRequestsError()
    mockGateway.resendVerificationEmail.mockResolvedValueOnce(
      err(tooManyRequestsError)
    )
    const useCase = new ResendVerificationEmailUseCase(
      mockGateway as unknown as AuthGatewayPort
    )

    await expect(useCase.execute("user@example.com")).resolves.toEqual(
      err(tooManyRequestsError)
    )
  })
})
