import { describe, it, expect } from "vitest"
import { err, isErr, isOk, ok, type Result } from "./result"

describe("Result", () => {
  it("creates a frozen Ok<void> result when called without arguments", () => {
    const result = ok()

    expect(result).toEqual({ ok: true, value: undefined })
    expect(isOk(result)).toBe(true)
    expect(isErr(result)).toBe(false)
    expect(Object.isFrozen(result)).toBe(true)
  })

  it("creates a frozen Ok<T> result wrapping the provided value", () => {
    const payload = { id: 42, email: "user@example.com" }
    const result: Result<typeof payload, string> = ok(payload)

    expect(result).toEqual({ ok: true, value: payload })
    expect(isOk(result)).toBe(true)
    expect(isErr(result)).toBe(false)
    expect(Object.isFrozen(result)).toBe(true)
  })

  it("creates a frozen Err<E> result wrapping the provided error", () => {
    const domainError = {
      kind: "invalid_credentials" as const,
      message: "Invalid credentials",
    }
    const result: Result<void, typeof domainError> = err(domainError)

    expect(result).toEqual({ ok: false, error: domainError })
    expect(isErr(result)).toBe(true)
    expect(isOk(result)).toBe(false)
    expect(Object.isFrozen(result)).toBe(true)
  })
})
