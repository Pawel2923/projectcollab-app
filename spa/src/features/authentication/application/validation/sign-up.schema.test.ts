import { describe, it, expect } from "vitest"
import { signUpSchema } from "./sign-up.schema"

describe("signUpSchema", () => {
  it("rejects empty email and empty password", () => {
    const result = signUpSchema.safeParse({ email: "", password: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      expect(fieldErrors.email).toBeDefined()
      expect(fieldErrors.password).toBeDefined()
    }
  })

  it("rejects invalid email address", () => {
    const result = signUpSchema.safeParse({
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
    const result = signUpSchema.safeParse({
      email: "new.user@example.com",
      password: "validPassword123",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        email: "new.user@example.com",
        password: "validPassword123",
      })
    }
  })
})
