import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToString } from "react-dom/server"
import { m } from "@/paraglide/messages"
import { UserContext } from "../context/UserContext"
import {
  VerifyEmailConfirmView,
  resolveVerificationFailureContent,
} from "./VerifyEmailConfirmView"

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

const VALID_PARAMS = {
  id: "42",
  expires: "1799999999",
  signature: "valid-signature",
  token: "valid-token",
}

describe("VerifyEmailConfirmView", () => {
  it("renders verifying loading state initially when query params are valid", () => {
    const html = renderToString(
      <VerifyEmailConfirmView params={VALID_PARAMS} />
    )

    expect(html).toContain('role="status"')
    expect(html).toContain(m.auth_verify_email_confirm_verifying_title())
    expect(html).toContain(m.auth_verify_email_confirm_verifying_description())
  })

  it("renders invalid link error immediately when required query params are missing", () => {
    const html = renderToString(
      <VerifyEmailConfirmView params={{ id: "42", expires: "1799999999" }} />
    )

    expect(html).toContain('role="alert"')
    expect(html).toContain(m.auth_verify_email_confirm_invalid_link_title())
    expect(html).toContain(
      m.auth_verify_email_confirm_invalid_link_description()
    )
    expect(html).toContain('href="/verify-email"')
    expect(html).toContain('href="/signin"')
  })

  it("renders verified success state with Sign in CTA for guest users", () => {
    const html = renderToString(
      <VerifyEmailConfirmView
        params={VALID_PARAMS}
        initialState={{ status: "verified" }}
      />
    )

    expect(html).toContain('role="status"')
    expect(html).toContain(m.auth_verify_email_confirm_success_title())
    expect(html).toContain(m.auth_verify_email_confirm_success_description())
    expect(html).toContain('href="/signin"')
    expect(html).toContain('href="/"')
  })

  it("renders verified success state with Go to app CTA for authenticated users", () => {
    const html = renderToString(
      <UserContext.Provider
        value={{
          user: {
            id: 42,
            email: "user@example.com",
            roles: ["ROLE_USER"],
            isVerified: true,
          },
          setUser: () => {},
          isLoading: false,
          isLoggingOut: false,
          logout: async () => {},
        }}
      >
        <VerifyEmailConfirmView
          params={VALID_PARAMS}
          initialState={{ status: "verified" }}
        />
      </UserContext.Provider>
    )

    expect(html).toContain(m.auth_verify_email_confirm_success_title())
    expect(html).toContain('href="/organizations"')
    expect(html).toContain(m.auth_verify_email_confirm_go_to_app())
  })

  it("renders user not found failure state with signup and signin links", () => {
    const html = renderToString(
      <VerifyEmailConfirmView
        params={VALID_PARAMS}
        initialState={{ status: "failed", reason: "user_not_found" }}
      />
    )

    expect(html).toContain('role="alert"')
    expect(html).toContain(m.auth_verify_email_confirm_user_not_found_title())
    expect(html).toContain('href="/signup"')
    expect(html).toContain('href="/signin"')
  })

  it("renders server error state with retry button and request new link action", () => {
    const html = renderToString(
      <VerifyEmailConfirmView
        params={VALID_PARAMS}
        initialState={{ status: "failed", reason: "server_error" }}
      />
    )

    expect(html).toContain('role="alert"')
    expect(html).toContain(m.auth_verify_email_confirm_server_error_title())
    expect(html).toContain(m.auth_verify_email_confirm_retry_button())
    expect(html).toContain('href="/verify-email"')
  })

  describe("resolveVerificationFailureContent", () => {
    it("maps each failure reason to localized title and description", () => {
      expect(resolveVerificationFailureContent("invalid_link")).toEqual({
        title: m.auth_verify_email_confirm_invalid_link_title(),
        description: m.auth_verify_email_confirm_invalid_link_description(),
      })

      expect(resolveVerificationFailureContent("user_not_found")).toEqual({
        title: m.auth_verify_email_confirm_user_not_found_title(),
        description: m.auth_verify_email_confirm_user_not_found_description(),
      })

      expect(resolveVerificationFailureContent("verification_failed")).toEqual({
        title: m.auth_verify_email_confirm_failed_title(),
        description: m.auth_verify_email_confirm_failed_description(),
      })

      expect(resolveVerificationFailureContent("server_error")).toEqual({
        title: m.auth_verify_email_confirm_server_error_title(),
        description: m.auth_verify_email_confirm_server_error_description(),
      })
    })
  })
})
