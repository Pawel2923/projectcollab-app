import { describe, it, expect, vi, beforeEach } from "vitest"
import type { QueryClient } from "@tanstack/react-query"
import { err, ok } from "@/shared/result"
import { SignUpUseCase } from "./sign-up.use-case"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import {
  createInvalidCredentialsError,
  createUserAlreadyExistsError,
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
      login: vi.fn().mockResolvedValue(ok()),
      signUp: vi.fn().mockResolvedValue(ok()),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshTokens: vi.fn(),
      onAuthFailure: vi.fn(),
    }
    mockQueryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    }
  })

  it("registers user, logs in, invalidates currentUser query cache, and returns ok", async () => {
    const useCase = new SignUpUseCase(
      mockGateway as unknown as AuthGatewayPort,
      mockQueryClient as unknown as QueryClient
    )
    const credentials = { email: "new@example.com", password: "secretPassword" }

    const result = await useCase.execute(credentials)

    expect(result).toEqual(ok())
    expect(mockGateway.signUp).toHaveBeenCalledWith(credentials)
    expect(mockGateway.login).toHaveBeenCalledWith(credentials)
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: authKeys.currentUser(),
    })
  })

  it("halts execution and does not log in or invalidate cache when gateway.signUp returns err", async () => {
    const userExistsError = createUserAlreadyExistsError()
    mockGateway.signUp.mockResolvedValueOnce(err(userExistsError))
    const useCase = new SignUpUseCase(
      mockGateway as unknown as AuthGatewayPort,
      mockQueryClient as unknown as QueryClient
    )

    const result = await useCase.execute({
      email: "taken@example.com",
      password: "secret",
    })

    expect(result).toEqual(err(userExistsError))
    expect(mockGateway.login).not.toHaveBeenCalled()
    expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled()
  })

  it("returns login error result and does not invalidate cache when subsequent gateway.login returns err", async () => {
    const invalidCredentialsError = createInvalidCredentialsError()
    mockGateway.login.mockResolvedValueOnce(err(invalidCredentialsError))
    const useCase = new SignUpUseCase(
      mockGateway as unknown as AuthGatewayPort,
      mockQueryClient as unknown as QueryClient
    )

    const result = await useCase.execute({
      email: "new@example.com",
      password: "secret",
    })

    expect(result).toEqual(err(invalidCredentialsError))
    expect(mockGateway.signUp).toHaveBeenCalledTimes(1)
    expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled()
  })
})
