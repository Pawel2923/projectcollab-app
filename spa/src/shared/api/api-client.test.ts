import { describe, it, expect, vi } from "vitest"
import { formatApiUrl, onAuthFailure, notifyAuthFailure } from "./api-client"

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
})
