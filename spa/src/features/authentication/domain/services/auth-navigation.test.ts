import { describe, it, expect } from "vitest"
import { getPostLoginRedirect } from "./auth-navigation"

describe("getPostLoginRedirect", () => {
  it("defaults to /organizations when redirectUrl is not provided", () => {
    expect(getPostLoginRedirect()).toBe("/organizations")
    expect(getPostLoginRedirect("")).toBe("/organizations")
  })

  it("defaults to /organizations for root path /", () => {
    expect(getPostLoginRedirect("/")).toBe("/organizations")
  })

  it("defaults to /organizations for auth-related paths", () => {
    expect(getPostLoginRedirect("/signin")).toBe("/organizations")
    expect(getPostLoginRedirect("/signup")).toBe("/organizations")
    expect(getPostLoginRedirect("/logout")).toBe("/organizations")
    expect(getPostLoginRedirect("/verify-email")).toBe("/organizations")
    expect(getPostLoginRedirect("/reset-password")).toBe("/organizations")
  })

  it("rejects protocol-relative and external URLs", () => {
    expect(getPostLoginRedirect("//evil.com")).toBe("/organizations")
    expect(getPostLoginRedirect("https://evil.com")).toBe("/organizations")
    expect(getPostLoginRedirect("javascript:alert(1)")).toBe("/organizations")
  })

  it("accepts valid application paths", () => {
    expect(getPostLoginRedirect("/projects/1")).toBe("/projects/1")
    expect(getPostLoginRedirect("/organizations/123/settings")).toBe(
      "/organizations/123/settings"
    )
    expect(getPostLoginRedirect("/dashboard?tab=activity")).toBe(
      "/dashboard?tab=activity"
    )
  })
})
