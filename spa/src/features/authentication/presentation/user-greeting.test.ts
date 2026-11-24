import { describe, it, expect, beforeEach } from "vitest"
import { setAppLocale } from "@/shared/i18n"
import { getUserGreeting } from "./user-greeting"

describe("getUserGreeting", () => {
  beforeEach(async () => {
    await setAppLocale("pl")
  })

  it("returns localized Polish greeting with display name when available", () => {
    expect(getUserGreeting({ username: "alice" })).toBe("Cześć alice")
    expect(getUserGreeting({ email: "bob@example.com" })).toBe(
      "Cześć bob@example.com"
    )
  })

  it("returns localized English greeting when locale is English", async () => {
    await setAppLocale("en")

    expect(getUserGreeting({ username: "alice" })).toBe("Hi alice")
    expect(getUserGreeting({ email: "bob@example.com" })).toBe(
      "Hi bob@example.com"
    )
  })

  it("returns empty string when display name cannot be resolved", async () => {
    expect(getUserGreeting(null)).toBe("")
    expect(getUserGreeting(undefined)).toBe("")

    await setAppLocale("en")
    expect(getUserGreeting(null)).toBe("")
    expect(getUserGreeting(undefined)).toBe("")
  })
})
