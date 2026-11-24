import { describe, it, expect, vi, beforeEach } from "vitest"
import type { QueryClient } from "@tanstack/react-query"
import { VerifyEmailUseCase } from "./verify-email.use-case"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { authKeys } from "../auth-keys"

describe("VerifyEmailUseCase", () => {
  let mockGateway: {
    login: ReturnType<typeof vi.fn>
    signUp: ReturnType<typeof vi.fn>
    resendVerificationEmail: ReturnType<typeof vi.fn>
    verifyEmail: ReturnType<typeof vi.fn>
    logout: ReturnType<typeof vi.fn>
    getCurrentUser: ReturnType<typeof vi.fn>
    refreshTokens: ReturnType<typeof vi.fn>
    onAuthFailure: ReturnType<typeof vi.fn>
  }
  let mockQueryClient: {
    invalidateQueries: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockGateway = {
      login: vi.fn(),
      signUp: vi.fn(),
      resendVerificationEmail: vi.fn(),
      verifyEmail: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshTokens: vi.fn(),
      onAuthFailure: vi.fn(),
    }
    mockQueryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    }
  })

  it("verifies valid link params via gateway and invalidates currentUser cache on success", async () => {
    mockGateway.verifyEmail.mockResolvedValueOnce({ status: "verified" })
    const useCase = new VerifyEmailUseCase(
      mockGateway as unknown as AuthGatewayPort,
      mockQueryClient as unknown as QueryClient
    )

    const result = await useCase.execute({
      id: "42",
      expires: "1799999999",
      signature: "sig-123",
      token: "tok-456",
    })

    expect(result).toEqual({ status: "verified" })
    expect(mockGateway.verifyEmail).toHaveBeenCalledWith({
      id: "42",
      expires: "1799999999",
      signature: "sig-123",
      token: "tok-456",
    })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: authKeys.currentUser(),
    })
  })

  it("returns invalid_link without calling gateway or invalidating cache when params are missing or malformed", async () => {
    const useCase = new VerifyEmailUseCase(
      mockGateway as unknown as AuthGatewayPort,
      mockQueryClient as unknown as QueryClient
    )

    const result = await useCase.execute({
      id: "not-a-number",
      expires: "1799999999",
      signature: "sig-123",
      token: "tok-456",
    })

    expect(result).toEqual({ status: "failed", reason: "invalid_link" })
    expect(mockGateway.verifyEmail).not.toHaveBeenCalled()
    expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled()
  })

  it("returns gateway failure result without invalidating currentUser cache", async () => {
    mockGateway.verifyEmail.mockResolvedValueOnce({
      status: "failed",
      reason: "user_not_found",
    })
    const useCase = new VerifyEmailUseCase(
      mockGateway as unknown as AuthGatewayPort,
      mockQueryClient as unknown as QueryClient
    )

    const result = await useCase.execute({
      id: "42",
      expires: "1799999999",
      signature: "sig-123",
      token: "tok-456",
    })

    expect(result).toEqual({ status: "failed", reason: "user_not_found" })
    expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled()
  })
})
