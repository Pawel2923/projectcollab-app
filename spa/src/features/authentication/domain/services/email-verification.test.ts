import { describe, it, expect } from "vitest"
import {
  getVerifyEmailKey,
  normalizeVerifyEmailSearchParams,
  parseVerifyEmailParams,
} from "./email-verification"

describe("email-verification domain service", () => {
  describe("normalizeVerifyEmailSearchParams", () => {
    it("extracts string search params and trims whitespace", () => {
      expect(
        normalizeVerifyEmailSearchParams({
          id: " 42 ",
          expires: " 1799999999 ",
          signature: " sig-abc ",
          token: " tok-xyz ",
        })
      ).toEqual({
        id: "42",
        expires: "1799999999",
        signature: "sig-abc",
        token: "tok-xyz",
      })
    })

    it("converts numeric id and expires values parsed by TanStack Router to strings", () => {
      expect(
        normalizeVerifyEmailSearchParams({
          id: 42,
          expires: 1799999999,
          signature: "sig-abc",
          token: "tok-xyz",
        })
      ).toEqual({
        id: "42",
        expires: "1799999999",
        signature: "sig-abc",
        token: "tok-xyz",
      })
    })

    it("ignores non-primitive, empty, or non-finite values", () => {
      expect(
        normalizeVerifyEmailSearchParams({
          id: Number.NaN,
          expires: Number.POSITIVE_INFINITY,
          signature: "   ",
          token: ["array"],
        })
      ).toEqual({
        id: undefined,
        expires: undefined,
        signature: undefined,
        token: undefined,
      })
    })
  })

  describe("parseVerifyEmailParams", () => {
    it("returns strongly typed VerifyEmailParams when all required parameters are valid", () => {
      const result = parseVerifyEmailParams({
        id: "123",
        expires: "1799999999",
        signature: "valid-signature",
        token: "valid-token",
      })

      expect(result).toEqual({
        id: "123",
        expires: "1799999999",
        signature: "valid-signature",
        token: "valid-token",
      })
    })

    it("accepts numeric id and expires values", () => {
      const result = parseVerifyEmailParams({
        id: 123,
        expires: 1799999999,
        signature: "valid-signature",
        token: "valid-token",
      })

      expect(result).toEqual({
        id: "123",
        expires: "1799999999",
        signature: "valid-signature",
        token: "valid-token",
      })
    })

    it("returns null when any required parameter is missing or blank", () => {
      expect(
        parseVerifyEmailParams({
          expires: "1799999999",
          signature: "sig",
          token: "tok",
        })
      ).toBeNull()

      expect(
        parseVerifyEmailParams({
          id: "123",
          signature: "sig",
          token: "tok",
        })
      ).toBeNull()

      expect(
        parseVerifyEmailParams({
          id: "123",
          expires: "1799999999",
          token: "tok",
        })
      ).toBeNull()

      expect(
        parseVerifyEmailParams({
          id: "123",
          expires: "1799999999",
          signature: "sig",
          token: "   ",
        })
      ).toBeNull()
    })

    it("returns null when id or expires is not a positive integer string", () => {
      expect(
        parseVerifyEmailParams({
          id: "abc",
          expires: "1799999999",
          signature: "sig",
          token: "tok",
        })
      ).toBeNull()

      expect(
        parseVerifyEmailParams({
          id: "0",
          expires: "1799999999",
          signature: "sig",
          token: "tok",
        })
      ).toBeNull()

      expect(
        parseVerifyEmailParams({
          id: "123",
          expires: "-5",
          signature: "sig",
          token: "tok",
        })
      ).toBeNull()

      expect(
        parseVerifyEmailParams({
          id: "12.5",
          expires: "1799999999",
          signature: "sig",
          token: "tok",
        })
      ).toBeNull()
    })
  })

  describe("getVerifyEmailKey", () => {
    it("produces distinct deterministic keys for different verification payloads", () => {
      const keyA = getVerifyEmailKey({
        id: "1",
        expires: "1700000000",
        signature: "sig-a",
        token: "tok-a",
      })
      const keyB = getVerifyEmailKey({
        id: "1",
        expires: "1700000000",
        signature: "sig-b",
        token: "tok-a",
      })

      expect(keyA).toBe(
        getVerifyEmailKey({
          id: "1",
          expires: "1700000000",
          signature: "sig-a",
          token: "tok-a",
        })
      )
      expect(keyA).not.toBe(keyB)
    })
  })
})
