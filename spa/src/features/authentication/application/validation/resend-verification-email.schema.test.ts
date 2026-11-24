import { describe, it, expect } from "vitest"
import { m } from "@/paraglide/messages"
import { resendVerificationEmailSchema } from "./resend-verification-email.schema"

describe("resendVerificationEmailSchema", () => {
  it("accepts and trims a valid email address", () => {
    const result = resendVerificationEmailSchema.safeParse({
      email: "  user@example.com  ",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("user@example.com")
    }
  })

  it("rejects empty email with translated required message", () => {
    const result = resendVerificationEmailSchema.safeParse({ email: "   " })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(m.auth_email_required())
    }
  })

  it("rejects malformed email with translated invalid email message", () => {
    const result = resendVerificationEmailSchema.safeParse({
      email: "not-an-email",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(m.auth_email_invalid())
    }
  })
})
