import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToString } from "react-dom/server"
import { m } from "@/paraglide/messages"
import { ApiError, SYMFONY_VIOLATION_CODES } from "@/shared/api"
import { TooManyRequestsError } from "../../domain/errors/auth-error"
import { VerifyEmailView } from "./VerifyEmailView"
import { resolveResendVerifyEmailError } from "./ResendVerifyEmailButton"

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    search,
    ...props
  }: {
    children?: React.ReactNode
    to: string
    search?: Record<string, string>
    [key: string]: unknown
  }) => {
    const query = search ? `?${new URLSearchParams(search).toString()}` : ""
    return (
      <a href={`${to}${query}`} {...props}>
        {children}
      </a>
    )
  },
}))

describe("VerifyEmailView & ResendVerifyEmailButton", () => {
  it("renders verify email card, back to signup button, brand logotype link, instructions, and resend button", () => {
    const html = renderToString(<VerifyEmailView />)

    expect(html).toContain(
      `aria-label="${m.auth_verify_email_back_to_signup()}"`
    )
    expect(html).toContain('href="/signup"')
    expect(html).toContain(
      `aria-label="${m.landing_nav_logotype_aria_label()}"`
    )
    expect(html).toContain('href="/"')

    expect(html).toContain(m.auth_verify_email_title())
    expect(html).toContain(m.auth_verify_email_description_check_inbox())
    expect(html).toContain(m.auth_verify_email_description_check_spam())
    expect(html).toContain(m.auth_verify_email_resend_button())
  })

  describe("resolveResendVerifyEmailError", () => {
    it("maps TooManyRequestsError to rate-limit message", () => {
      expect(resolveResendVerifyEmailError(new TooManyRequestsError())).toBe(
        m.auth_verify_email_too_many_requests()
      )
    })

    it("maps 422 ApiError email violation to translated message without leaking violation code", () => {
      const apiError = new ApiError(422, {
        violations: [
          {
            propertyPath: "email",
            message: "This value is not a valid email address.",
            code: SYMFONY_VIOLATION_CODES.EMAIL_INVALID_FORMAT,
          },
        ],
      })

      const message = resolveResendVerifyEmailError(apiError)
      expect(message).toBe(m.validation_invalid_email())
      expect(message).not.toContain(
        SYMFONY_VIOLATION_CODES.EMAIL_INVALID_FORMAT
      )
    })

    it("maps unexpected errors to generic verification email failure message", () => {
      expect(resolveResendVerifyEmailError(new Error("Network failure"))).toBe(
        m.auth_verify_email_send_failed()
      )
    })
  })
})
