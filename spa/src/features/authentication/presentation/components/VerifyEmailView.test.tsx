import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToString } from "react-dom/server"
import { m } from "@/paraglide/messages"
import { ApiError, SYMFONY_VIOLATION_CODES } from "@/shared/api"
import { TooManyRequestsError } from "../../domain/errors/auth-error"
import { UserContext } from "../context/UserContext"
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
  it("renders verify email card, back to signup button, brand logotype link, instructions, email input fallback, and sign-in link when identity is unknown", () => {
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
    expect(html).toContain(m.auth_verify_email_enter_email_hint())
    expect(html).toContain('id="resend-verify-email"')
    expect(html).not.toContain("placeholder=")
    expect(html).toContain(m.auth_verify_email_resend_button())
    expect(html).toContain('href="/signin"')
  })

  it("renders sent-to email notice and direct resend button without email input when email prop is provided", () => {
    const html = renderToString(<VerifyEmailView email="alice@example.com" />)

    expect(html).toContain(
      m.auth_verify_email_sent_to({ email: "alice@example.com" })
    )
    expect(html).toContain(m.auth_verify_email_resend_button())
    expect(html).not.toContain('id="resend-verify-email"')
  })

  it("renders already-verified card with Go to app link when authenticated user is already verified", () => {
    const html = renderToString(
      <UserContext.Provider
        value={{
          user: {
            id: 1,
            email: "verified@example.com",
            roles: ["ROLE_USER"],
            isVerified: true,
          },
          setUser: () => {},
          isLoading: false,
          logout: async () => {},
        }}
      >
        <VerifyEmailView />
      </UserContext.Provider>
    )

    expect(html).toContain(m.auth_verify_email_already_verified_title())
    expect(html).toContain(m.auth_verify_email_already_verified_description())
    expect(html).toContain('href="/organizations"')
    expect(html).toContain(m.auth_verify_email_confirm_go_to_app())
    expect(html).not.toContain(m.auth_verify_email_resend_button())
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
