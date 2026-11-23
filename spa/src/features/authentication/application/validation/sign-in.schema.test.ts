import { describe, it, expect } from "vitest"
import { signInSchema } from "./sign-in.schema"

describe("signInSchema", () => {
  it("rejects empty email and empty password", () => {
    const result = signInSchema.safeParse({ email: "", password: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      expect(fieldErrors.email).toBeDefined()
      expect(fieldErrors.password).toBeDefined()
    }
  })

  it("rejects invalid email address", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "somepassword",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      expect(fieldErrors.email).toBeDefined()
      expect(fieldErrors.password).toBeUndefined()
    }
  })

  it("accepts valid email and password", () => {
    const result = signInSchema.safeParse({
      email: "valid.user@example.com",
      password: "validPassword123",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        email: "valid.user@example.com",
        password: "validPassword123",
      })
    }
  })
})
