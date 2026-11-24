import type { Result } from "@/shared/result"
import type {
  EmailVerificationError,
  EmailVerificationErrorKind,
} from "../errors/auth-error"

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
  EmailVerificationErrorKind | "server_error"

export type EmailVerificationResult = Result<void, EmailVerificationError>
