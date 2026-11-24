import { describe, it, expect, vi, beforeEach } from "vitest"
import type { QueryClient } from "@tanstack/react-query"
import { LoginUseCase } from "./login.use-case"
import { LogoutUseCase } from "./logout.use-case"
import { GetCurrentUserUseCase } from "./get-current-user.use-case"
import { RefreshTokensUseCase } from "./refresh-tokens.use-case"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import type { User } from "../../domain/models/user"
import { InvalidCredentialsError } from "../../domain/errors/auth-error"
import { authKeys } from "../auth-keys"

describe("Authentication Use Cases", () => {
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
    cancelQueries: ReturnType<typeof vi.fn>
    setQueryData: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockGateway = {
      login: vi.fn(),
      signUp: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshTokens: vi.fn(),
      onAuthFailure: vi.fn(),
    }
    mockQueryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
      cancelQueries: vi.fn().mockResolvedValue(undefined),
      setQueryData: vi.fn(),
      clear: vi.fn(),
    }
  })

  describe("LoginUseCase", () => {
    it("logs in with credentials and invalidates currentUser query cache", async () => {
      const useCase = new LoginUseCase(
        mockGateway as unknown as AuthGatewayPort,
        mockQueryClient as unknown as QueryClient
      )
      const credentials = { email: "test@example.com", password: "secret" }

      await useCase.execute(credentials)

      expect(mockGateway.login).toHaveBeenCalledWith(credentials)
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: authKeys.currentUser(),
      })
    })

    it("propagates error and does not invalidate query cache if gateway.login fails", async () => {
      mockGateway.login.mockRejectedValueOnce(
        new InvalidCredentialsError("Invalid credentials")
      )
      const useCase = new LoginUseCase(
        mockGateway as unknown as AuthGatewayPort,
        mockQueryClient as unknown as QueryClient
      )

      await expect(
        useCase.execute({ email: "wrong@test.com", password: "bad" })
      ).rejects.toThrow(InvalidCredentialsError)

      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled()
    })
  })

  describe("LogoutUseCase", () => {
    it("calls gateway logout, cancels queries, clears cache, nulls current user, runs cleanup, and redirects", async () => {
      const redirectFn = vi.fn()
      const onCleanup = vi.fn()
      const useCase = new LogoutUseCase(
        mockGateway as unknown as AuthGatewayPort,
        mockQueryClient as unknown as QueryClient,
        redirectFn
      )

      await useCase.execute({ onCleanup })

      expect(mockGateway.logout).toHaveBeenCalledWith()
      expect(mockQueryClient.cancelQueries).toHaveBeenCalledTimes(1)
      expect(mockQueryClient.clear).toHaveBeenCalledTimes(1)
      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        authKeys.currentUser(),
        null
      )
      expect(onCleanup).toHaveBeenCalledTimes(1)
      expect(redirectFn).toHaveBeenCalledWith("/signin")
    })

    it("clears query cache, nulls current user, runs cleanup, and redirects even if backend logout fails", async () => {
      mockGateway.logout.mockRejectedValueOnce(new Error("Network error"))
      const redirectFn = vi.fn()
      const onCleanup = vi.fn()
      const useCase = new LogoutUseCase(
        mockGateway as unknown as AuthGatewayPort,
        mockQueryClient as unknown as QueryClient,
        redirectFn
      )

      await useCase.execute({ onCleanup })

      expect(mockQueryClient.cancelQueries).toHaveBeenCalledTimes(1)
      expect(mockQueryClient.clear).toHaveBeenCalledTimes(1)
      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        authKeys.currentUser(),
        null
      )
      expect(onCleanup).toHaveBeenCalledTimes(1)
      expect(redirectFn).toHaveBeenCalledWith("/signin")
    })

    it("uses per-execution redirect override when provided", async () => {
      const defaultRedirect = vi.fn()
      const customRedirect = vi.fn()
      const useCase = new LogoutUseCase(
        mockGateway as unknown as AuthGatewayPort,
        mockQueryClient as unknown as QueryClient,
        defaultRedirect
      )

      await useCase.execute({ redirect: customRedirect })

      expect(customRedirect).toHaveBeenCalledWith("/signin")
      expect(defaultRedirect).not.toHaveBeenCalled()
    })

    it("deduplicates concurrent logout calls while a logout is already in flight", async () => {
      let resolveLogout!: () => void
      mockGateway.logout.mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveLogout = resolve
          })
      )
      const redirectFn = vi.fn()
      const useCase = new LogoutUseCase(
        mockGateway as unknown as AuthGatewayPort,
        mockQueryClient as unknown as QueryClient,
        redirectFn
      )

      const first = useCase.execute()
      const second = useCase.execute()

      resolveLogout()
      await Promise.all([first, second])

      expect(mockGateway.logout).toHaveBeenCalledTimes(1)
      expect(mockQueryClient.clear).toHaveBeenCalledTimes(1)
      expect(redirectFn).toHaveBeenCalledTimes(1)
    })
  })

  describe("GetCurrentUserUseCase", () => {
    it("returns domain user from gateway", async () => {
      const domainUser: User = {
        id: 1,
        email: "user@test.com",
        roles: ["ROLE_USER"],
      }
      mockGateway.getCurrentUser.mockResolvedValueOnce(domainUser)

      const useCase = new GetCurrentUserUseCase(
        mockGateway as unknown as AuthGatewayPort
      )
      const result = await useCase.execute()

      expect(result).toBe(domainUser)
      expect(mockGateway.getCurrentUser).toHaveBeenCalledTimes(1)
    })
  })

  describe("RefreshTokensUseCase", () => {
    it("delegates token refresh to gateway with no arguments — cookie is automatic", async () => {
      mockGateway.refreshTokens.mockResolvedValueOnce(true)
      const useCase = new RefreshTokensUseCase(
        mockGateway as unknown as AuthGatewayPort
      )

      const result = await useCase.execute()
      expect(result).toBe(true)
      expect(mockGateway.refreshTokens).toHaveBeenCalledWith()
      expect(mockGateway.refreshTokens).toHaveBeenCalledTimes(1)
    })
  })
})
