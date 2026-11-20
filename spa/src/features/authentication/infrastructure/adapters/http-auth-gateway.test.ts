import { describe, it, expect, vi, beforeEach } from "vitest"
import { HttpAuthGateway } from "./http-auth-gateway"
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
  let gateway: HttpAuthGateway

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
    }
    mockApiFetch = vi.fn()
    mockRefreshTokens = vi.fn()
    mockOnAuthFailure = vi.fn()

    gateway = new HttpAuthGateway({
      apiClient: mockApiClient as unknown as typeof apiClient,
      apiFetch: mockApiFetch as unknown as typeof apiFetch,
      refreshTokens: mockRefreshTokens as unknown as typeof refreshTokens,
      onAuthFailure: mockOnAuthFailure as unknown as typeof onAuthFailure,
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

  it("calls logout endpoint with refresh_token provided directly", async () => {
    mockApiFetch.mockResolvedValueOnce({})

    await gateway.logout("direct-refresh-token")

    expect(mockApiFetch).toHaveBeenCalledWith("/core-api/auth/logout", {
      method: "POST",
      body: { refresh_token: "direct-refresh-token" },
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
  })

  it("calls logout endpoint with refresh_token captured from login", async () => {
    mockApiFetch.mockResolvedValueOnce({
      token: "jwt-token-123",
      refresh_token: "login-refresh-token",
    })
    await gateway.login({ email: "user@test.com", password: "password123" })

    mockApiFetch.mockResolvedValueOnce({})
    await gateway.logout()

    expect(mockApiFetch).toHaveBeenLastCalledWith("/core-api/auth/logout", {
      method: "POST",
      body: { refresh_token: "login-refresh-token" },
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
  })

  it("clears captured refresh_token after logout", async () => {
    mockApiFetch.mockResolvedValueOnce({
      token: "jwt-token-123",
      refresh_token: "login-refresh-token",
    })
    await gateway.login({ email: "user@test.com", password: "password123" })

    mockApiFetch.mockResolvedValueOnce({})
    await gateway.logout()

    mockApiFetch.mockResolvedValueOnce({})
    await gateway.logout()

    expect(mockApiFetch).toHaveBeenLastCalledWith("/core-api/auth/logout", {
      method: "POST",
      body: { refresh_token: "" },
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
  })

  it("calls logout endpoint with empty string if no refresh token is available", async () => {
    mockApiFetch.mockResolvedValueOnce({})

    await gateway.logout()

    expect(mockApiFetch).toHaveBeenCalledWith("/core-api/auth/logout", {
      method: "POST",
      body: { refresh_token: "" },
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
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

  it("delegates refreshTokens and onAuthFailure", async () => {
    mockRefreshTokens.mockResolvedValueOnce(true)
    const refreshed = await gateway.refreshTokens()
    expect(refreshed).toBe(true)
    expect(mockRefreshTokens).toHaveBeenCalledWith("")

    const cb = vi.fn()
    gateway.onAuthFailure(cb)
    expect(mockOnAuthFailure).toHaveBeenCalledWith(cb)
  })

  it("passes stored refresh token to refreshTokens function", async () => {
    gateway.setRefreshToken("stored-refresh-token")
    mockRefreshTokens.mockResolvedValueOnce(true)

    const refreshed = await gateway.refreshTokens()

    expect(refreshed).toBe(true)
    expect(mockRefreshTokens).toHaveBeenCalledWith("stored-refresh-token")
  })

  it("passes explicit refresh token to refreshTokens function", async () => {
    gateway.setRefreshToken("stored-refresh-token")
    mockRefreshTokens.mockResolvedValueOnce(true)

    const refreshed = await gateway.refreshTokens("explicit-refresh-token")

    expect(refreshed).toBe(true)
    expect(mockRefreshTokens).toHaveBeenCalledWith("explicit-refresh-token")
  })

  it("passes token captured from login to refreshTokens function", async () => {
    mockApiFetch.mockResolvedValueOnce({
      token: "jwt-token-123",
      refresh_token: "captured-login-token",
    })
    await gateway.login({ email: "user@test.com", password: "password123" })

    mockRefreshTokens.mockResolvedValueOnce(true)
    const refreshed = await gateway.refreshTokens()

    expect(refreshed).toBe(true)
    expect(mockRefreshTokens).toHaveBeenCalledWith("captured-login-token")
  })
})
