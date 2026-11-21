import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  formatApiUrl,
  onAuthFailure,
  notifyAuthFailure,
  refreshTokens,
  setRefreshTokenResolver,
  apiFetch,
} from "./api-client"

describe("api-client helpers", () => {
  it("formats relative endpoints with /core-api prefix", () => {
    expect(formatApiUrl("/users/me")).toBe("/core-api/users/me")
    expect(formatApiUrl("users/me")).toBe("/core-api/users/me")
  })

  it("does not duplicate /core-api if already present", () => {
    expect(formatApiUrl("/core-api/auth/login")).toBe("/core-api/auth/login")
  })

  it("preserves absolute HTTP and HTTPS URLs", () => {
    expect(formatApiUrl("https://example.com/api/test")).toBe(
      "https://example.com/api/test"
    )
    expect(formatApiUrl("http://example.com/api/test")).toBe(
      "http://example.com/api/test"
    )
  })

  it("notifies auth failure subscribers and allows unsubscribing", () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    const unsubscribe1 = onAuthFailure(listener1)
    const unsubscribe2 = onAuthFailure(listener2)

    notifyAuthFailure()
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)

    unsubscribe1()
    notifyAuthFailure()
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(2)

    unsubscribe2()
  })

  it("setRefreshTokenResolver is a no-op for backward compatibility", () => {
    // Should not throw
    expect(() => setRefreshTokenResolver(() => "token")).not.toThrow()
    expect(() => setRefreshTokenResolver(null)).not.toThrow()
  })
})

describe("apiFetch auth failure and retry lifecycle", () => {
  let originalWindow: typeof window | undefined
  let mockLocation: { pathname: string; href: string }

  beforeEach(() => {
    mockLocation = { pathname: "/dashboard", href: "" }
    originalWindow = globalThis.window
    // @ts-expect-error Mocking window in node environment
    globalThis.window = { location: mockLocation }
  })

  afterEach(() => {
    // @ts-expect-error Restoring window
    globalThis.window = originalWindow
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("retries request after successful token refresh on initial 401", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Unauthorized" }),
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Refreshed" }),
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ id: 1, name: "Alice" }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const result = await apiFetch<{ id: number; name: string }>("/users/me")
    expect(result).toEqual({ id: 1, name: "Alice" })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it("notifies auth failure subscribers and redirects when retry returns a second 401", async () => {
    const authFailureListener = vi.fn()
    const unsubscribe = onAuthFailure(authFailureListener)

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Unauthorized" }),
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Refreshed" }),
      })
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Still Unauthorized" }),
      })
    vi.stubGlobal("fetch", fetchMock)

    await expect(apiFetch("/users/me")).rejects.toThrow("Session expired")

    expect(authFailureListener).toHaveBeenCalledTimes(1)
    expect(mockLocation.href).toBe("/signin?redirect=%2Fdashboard")

    unsubscribe()
  })

  it("notifies auth failure subscribers and redirects when initial 401 refresh fails", async () => {
    const authFailureListener = vi.fn()
    const unsubscribe = onAuthFailure(authFailureListener)

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Unauthorized" }),
      })
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Refresh token expired" }),
      })
    vi.stubGlobal("fetch", fetchMock)

    await expect(apiFetch("/users/me")).rejects.toThrow("Session expired")

    expect(authFailureListener).toHaveBeenCalledTimes(1)
    expect(mockLocation.href).toBe("/signin?redirect=%2Fdashboard")

    unsubscribe()
  })

  it("respects skipAuthRedirect option on second 401 failure", async () => {
    const authFailureListener = vi.fn()
    const unsubscribe = onAuthFailure(authFailureListener)

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Unauthorized" }),
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Refreshed" }),
      })
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Still Unauthorized" }),
      })
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      apiFetch("/users/me", { skipAuthRedirect: true })
    ).rejects.toThrow("Session expired")

    expect(authFailureListener).toHaveBeenCalledTimes(1)
    expect(mockLocation.href).toBe("")

    unsubscribe()
  })
})

describe("refreshTokens", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("posts to /core-api/auth/refresh with no body — relies on refresh_token cookie", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      status: 200,
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ token: "new-jwt" }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const result = await refreshTokens()
    expect(result).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith("/core-api/auth/refresh", {
      method: "POST",
      headers: {
        Accept: "application/ld+json, application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      // No body — refresh_token cookie is automatic
    })
  })

  it("ignores the deprecated refreshToken argument and sends no body", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      status: 200,
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ token: "new-jwt" }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const result = await refreshTokens("ignored-token")
    expect(result).toBe(true)
    // Confirm no body was sent
    const calledWith = fetchMock.mock.calls[0][1]
    expect(calledWith.body).toBeUndefined()
  })

  it("returns false when the refresh endpoint returns a non-ok status", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      status: 401,
      ok: false,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ error: "INVALID_REFRESH_TOKEN" }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const result = await refreshTokens()
    expect(result).toBe(false)
  })
})
