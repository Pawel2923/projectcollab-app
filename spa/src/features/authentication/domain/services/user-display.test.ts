import { describe, it, expect } from "vitest"
import {
  generateUserInitials,
  getUserDisplayName,
  getUserGreeting,
} from "./user-display"

describe("user-display domain service", () => {
  describe("generateUserInitials", () => {
    it("returns uppercase first letter of username when available", () => {
      expect(
        generateUserInitials({ username: "alice", email: "alice@example.com" })
      ).toBe("A")
      expect(generateUserInitials({ username: "bob" })).toBe("B")
    })

    it("falls back to uppercase first letter of email when username is missing", () => {
      expect(generateUserInitials({ email: "charlie@example.com" })).toBe("C")
    })

    it("returns 'U' when neither username nor email is present", () => {
      expect(generateUserInitials(null)).toBe("U")
      expect(generateUserInitials(undefined)).toBe("U")
      expect(generateUserInitials({})).toBe("U")
    })
  })

  describe("getUserDisplayName", () => {
    it("prefers username when available", () => {
      expect(
        getUserDisplayName({ username: "alice", email: "alice@example.com" })
      ).toBe("alice")
    })

    it("falls back to email when username is not provided", () => {
      expect(getUserDisplayName({ email: "bob@example.com" })).toBe(
        "bob@example.com"
      )
    })

    it("returns empty string when user is null or undefined", () => {
      expect(getUserDisplayName(null)).toBe("")
      expect(getUserDisplayName(undefined)).toBe("")
      expect(getUserDisplayName({})).toBe("")
    })
  })

  describe("getUserGreeting", () => {
    it("returns friendly greeting with display name when available", () => {
      expect(getUserGreeting({ username: "alice" })).toBe("Cześć alice")
      expect(getUserGreeting({ email: "bob@example.com" })).toBe(
        "Cześć bob@example.com"
      )
    })

    it("returns empty string when display name cannot be resolved", () => {
      expect(getUserGreeting(null)).toBe("")
      expect(getUserGreeting(undefined)).toBe("")
    })
  })
})
