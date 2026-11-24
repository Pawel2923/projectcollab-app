export interface VerifyEmailParams {
  readonly id: string
  readonly expires: string
  readonly signature: string
  readonly token: string
}

export interface VerifyEmailSearchParams {
  readonly id?: string
  readonly expires?: string
  readonly signature?: string
  readonly token?: string
}

export type EmailVerificationFailureReason =
  "invalid_link" | "user_not_found" | "verification_failed" | "server_error"

export type EmailVerificationResult =
  | { readonly status: "verified" }
  | {
      readonly status: "failed"
      readonly reason: EmailVerificationFailureReason
    }
