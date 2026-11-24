import { describe, it, expect, vi, beforeEach } from "vitest"
import type { QueryClient } from "@tanstack/react-query"
import { SignUpUseCase } from "./sign-up.use-case"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from "../../domain/errors/auth-error"
import { authKeys } from "../auth-keys"

describe("SignUpUseCase", () => {
  let mockGateway: {
    login: ReturnType<typeof vi.fn>
    signUp: ReturnType<typeof vi.fn>
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
      login: vi.fn().mockResolvedValue(undefined),
      signUp: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshTokens: vi.fn(),
      onAuthFailure: vi.fn(),
    }
    mockQueryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    }
  })

  it("registers user, logs in, and invalidates currentUser query cache", async () => {
    const useCase = new SignUpUseCase(
      mockGateway as unknown as AuthGatewayPort,
      mockQueryClient as unknown as QueryClient
    )
    const credentials = { email: "new@example.com", password: "secretPassword" }

    await useCase.execute(credentials)

    expect(mockGateway.signUp).toHaveBeenCalledWith(credentials)
    expect(mockGateway.login).toHaveBeenCalledWith(credentials)
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: authKeys.currentUser(),
    })
  })

  it("halts execution and does not log in or invalidate cache when gateway.signUp fails", async () => {
    mockGateway.signUp.mockRejectedValueOnce(
      new UserAlreadyExistsError("User with this email already exists")
    )
    const useCase = new SignUpUseCase(
      mockGateway as unknown as AuthGatewayPort,
      mockQueryClient as unknown as QueryClient
    )

    await expect(
      useCase.execute({ email: "taken@example.com", password: "secret" })
    ).rejects.toThrow(UserAlreadyExistsError)

    expect(mockGateway.login).not.toHaveBeenCalled()
    expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled()
  })

  it("propagates error and does not invalidate cache when subsequent gateway.login fails", async () => {
    mockGateway.login.mockRejectedValueOnce(
      new InvalidCredentialsError("Invalid credentials")
    )
    const useCase = new SignUpUseCase(
      mockGateway as unknown as AuthGatewayPort,
      mockQueryClient as unknown as QueryClient
    )

    await expect(
      useCase.execute({ email: "new@example.com", password: "secret" })
    ).rejects.toThrow(InvalidCredentialsError)

    expect(mockGateway.signUp).toHaveBeenCalledTimes(1)
    expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled()
  })
})
