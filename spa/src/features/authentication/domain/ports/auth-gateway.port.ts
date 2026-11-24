import type { Result } from "@/shared/result"
import type {
  AuthValidationError,
  EmailVerificationError,
  InvalidCredentialsError,
  TooManyRequestsError,
  UserAlreadyExistsError,
} from "../errors/auth-error"
import type { LoginCredentials, SignUpCredentials } from "../models/credentials"
import type { VerifyEmailParams } from "../models/email-verification"
import type { User } from "../models/user"

export interface AuthGatewayPort {
  login(
    credentials: LoginCredentials
  ): Promise<Result<void, InvalidCredentialsError>>
  signUp(
    credentials: SignUpCredentials
  ): Promise<Result<void, UserAlreadyExistsError | AuthValidationError>>
  resendVerificationEmail(
    email: string
  ): Promise<Result<void, TooManyRequestsError | AuthValidationError>>
  verifyEmail(
    params: VerifyEmailParams
  ): Promise<Result<void, EmailVerificationError>>
  /** Invalidates the refresh-token server-side and clears auth cookies. */
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  /** Exchanges the refresh-token cookie for a new access-token cookie. */
  refreshTokens(): Promise<boolean>
  onAuthFailure(callback: () => void): () => void
}
