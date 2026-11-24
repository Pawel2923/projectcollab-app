import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToString } from "react-dom/server"
import { m } from "@/paraglide/messages"
import { SYMFONY_VIOLATION_CODES } from "@/shared/api"
import {
  createAuthValidationError,
  createUserAlreadyExistsError,
} from "../../domain/errors/auth-error"
import { SignUpForm, applySignUpError } from "./SignUpForm"
import { SignUpView } from "./SignUpView"

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
  useNavigate: () => vi.fn(),
}))

describe("SignUpForm & SignUpView", () => {
  it("renders sign up card, OAuth buttons, inputs without email placeholder, sign-in link, and policy links", () => {
    const html = renderToString(<SignUpForm />)

    expect(html).toContain(m.auth_sign_up_create_account())
    expect(html).toContain(m.auth_sign_up_subtitle())
    expect(html).toContain(m.auth_sign_up_with_microsoft())
    expect(html).toContain(m.auth_sign_up_with_google())
    expect(html).toContain(m.auth_sign_in_or_continue_with())

    expect(html).toContain('id="signup-email"')
    expect(html).toContain('type="email"')
    expect(html).toContain('autoComplete="email"')
    expect(html).not.toContain("placeholder=")

    expect(html).toContain('id="signup-password"')
    expect(html).toContain('autoComplete="new-password"')
    expect(html).toContain(`aria-label="${m.auth_show_password()}"`)

    expect(html).toContain(m.auth_sign_up_button())
    expect(html).toContain(m.auth_already_have_account())
    expect(html).toContain('href="/signin"')
    expect(html).toContain(m.auth_sign_in_link())

    expect(html).toContain(m.auth_sign_up_policy_agreement_prefix())
    expect(html).toContain('href="/policy/terms?referer=%2Fsignup"')
    expect(html).toContain('href="/policy/privacy?referer=%2Fsignup"')
  })

  it("renders search error alert banner when error prop is provided", () => {
    const configHtml = renderToString(<SignUpForm error="Configuration" />)
    expect(configHtml).toContain(m.auth_configuration_error())
    expect(configHtml).toContain('role="alert"')

    const deniedHtml = renderToString(<SignUpForm error="AccessDenied" />)
    expect(deniedHtml).toContain(m.auth_access_denied_error())

    const generalHtml = renderToString(<SignUpForm error="OAuthCallback" />)
    expect(generalHtml).toContain(m.auth_general_error())
  })

  it("renders SignUpView with BackButton and brand logotype link", () => {
    const html = renderToString(<SignUpView />)

    expect(html).toContain(`aria-label="${m.common_back()}"`)
    expect(html).toContain(
      `aria-label="${m.landing_nav_logotype_aria_label()}"`
    )
    expect(html).toContain('href="/"')
    expect(html).toContain(m.auth_sign_up_create_account())
  })

  describe("applySignUpError", () => {
    it("maps UserAlreadyExistsError to email field error", () => {
      const setError = vi.fn()
      applySignUpError(createUserAlreadyExistsError(), setError)

      expect(setError).toHaveBeenCalledWith("email", {
        message: m.auth_user_already_exists(),
      })
    })

    it("maps plainPassword AuthValidationError violation to translated password field error", () => {
      const setError = vi.fn()
      const validationError = createAuthValidationError([
        {
          propertyPath: "plainPassword",
          message: "This password has been leaked in a data breach.",
          code: SYMFONY_VIOLATION_CODES.NOT_COMPROMISED_PASSWORD,
        },
      ])

      applySignUpError(validationError, setError)

      expect(setError).toHaveBeenCalledWith("password", {
        message: m.validation_compromised_password(),
      })
    })

    it("maps email AuthValidationError violation with Email UUID code to translated email field error without leaking code", () => {
      const setError = vi.fn()
      const validationError = createAuthValidationError([
        {
          propertyPath: "email",
          message: "This value is not a valid email address.",
          code: SYMFONY_VIOLATION_CODES.EMAIL_INVALID_FORMAT,
        },
      ])

      applySignUpError(validationError, setError)

      expect(setError).toHaveBeenCalledWith("email", {
        message: m.validation_invalid_email(),
      })
      const passedMessage = setError.mock.calls[0][1].message
      expect(passedMessage).not.toContain(
        SYMFONY_VIOLATION_CODES.EMAIL_INVALID_FORMAT
      )
    })

    it("maps unknown violation code to safe translated field message without leaking code or raw technical message", () => {
      const setError = vi.fn()
      const unknownCode = "99999999-aaaa-bbbb-cccc-dddddddddddd"
      const validationError = createAuthValidationError([
        {
          propertyPath: "plainPassword",
          message: "SQLSTATE[23505] constraint failed code=99999999",
          code: unknownCode,
        },
      ])

      applySignUpError(validationError, setError)

      expect(setError).toHaveBeenCalledWith("password", {
        message: m.validation_invalid_value(),
      })
      const passedMessage = setError.mock.calls[0][1].message
      expect(passedMessage).not.toContain(unknownCode)
      expect(passedMessage).not.toContain("SQLSTATE")
    })

    it("maps form-level or unknown-field validation violations to root form error with translated message", () => {
      const setError = vi.fn()
      const validationError = createAuthValidationError([
        {
          propertyPath: "username",
          message: "This value should not be blank.",
          code: SYMFONY_VIOLATION_CODES.NOT_BLANK,
        },
      ])

      applySignUpError(validationError, setError)

      expect(setError).toHaveBeenCalledWith("root", {
        message: m.validation_not_blank(),
      })
    })

    it("maps unexpected errors to root form error", () => {
      const setError = vi.fn()
      applySignUpError(new Error("Network error"), setError)

      expect(setError).toHaveBeenCalledWith("root", {
        message: m.auth_sign_up_general_error(),
      })
    })
  })
})
