import { describe, it, expect, vi, beforeEach } from "vitest"
import type { QueryClient } from "@tanstack/react-query"
import { LoginUseCase } from "./login.use-case"
import { LogoutUseCase } from "./logout.use-case"
import { GetCurrentUserUseCase } from "./get-current-user.use-case"
import { RefreshTokensUseCase } from "./refresh-tokens.use-case"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import type { User } from "../../domain/models/user"
import { authKeys } from "../auth-keys"

describe("Authentication Use Cases", () => {
  let mockGateway: {
    login: ReturnType<typeof vi.fn>
    logout: ReturnType<typeof vi.fn>
    getCurrentUser: ReturnType<typeof vi.fn>
    refreshTokens: ReturnType<typeof vi.fn>
    onAuthFailure: ReturnType<typeof vi.fn>
  }
  let mockQueryClient: {
    invalidateQueries: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockGateway = {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshTokens: vi.fn(),
      onAuthFailure: vi.fn(),
    }
    mockQueryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
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
  })

  describe("LogoutUseCase", () => {
    it("calls gateway logout, clears query cache, and triggers redirect", async () => {
      const redirectFn = vi.fn()
      const useCase = new LogoutUseCase(
        mockGateway as unknown as AuthGatewayPort,
        mockQueryClient as unknown as QueryClient,
        redirectFn
      )

      await useCase.execute()

      expect(mockGateway.logout).toHaveBeenCalled()
      expect(mockQueryClient.clear).toHaveBeenCalled()
      expect(redirectFn).toHaveBeenCalledWith("/signin")
    })

    it("passes refreshToken to gateway logout", async () => {
      const redirectFn = vi.fn()
      const useCase = new LogoutUseCase(
        mockGateway as unknown as AuthGatewayPort,
        mockQueryClient as unknown as QueryClient,
        redirectFn
      )

      await useCase.execute("custom-refresh-token")

      expect(mockGateway.logout).toHaveBeenCalledWith("custom-refresh-token")
      expect(mockQueryClient.clear).toHaveBeenCalled()
      expect(redirectFn).toHaveBeenCalledWith("/signin")
    })

    it("clears query cache and redirects even if backend logout fails", async () => {
      mockGateway.logout.mockRejectedValueOnce(new Error("Network error"))
      const redirectFn = vi.fn()
      const useCase = new LogoutUseCase(
        mockGateway as unknown as AuthGatewayPort,
        mockQueryClient as unknown as QueryClient,
        redirectFn
      )

      await useCase.execute()

      expect(mockQueryClient.clear).toHaveBeenCalled()
      expect(redirectFn).toHaveBeenCalledWith("/signin")
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
    it("delegates token refresh to gateway", async () => {
      mockGateway.refreshTokens.mockResolvedValueOnce(true)
      const useCase = new RefreshTokensUseCase(
        mockGateway as unknown as AuthGatewayPort
      )

      const result = await useCase.execute()
      expect(result).toBe(true)
      expect(mockGateway.refreshTokens).toHaveBeenCalledTimes(1)
    })

    it("passes refreshToken to gateway refreshTokens", async () => {
      mockGateway.refreshTokens.mockResolvedValueOnce(true)
      const useCase = new RefreshTokensUseCase(
        mockGateway as unknown as AuthGatewayPort
      )

      const result = await useCase.execute("custom-refresh-token")
      expect(result).toBe(true)
      expect(mockGateway.refreshTokens).toHaveBeenCalledWith("custom-refresh-token")
    })
  })
})
