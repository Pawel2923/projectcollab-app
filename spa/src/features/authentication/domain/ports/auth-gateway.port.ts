import type { LoginCredentials, SignUpCredentials } from "../models/credentials"
import type {
  EmailVerificationResult,
  VerifyEmailParams,
} from "../models/email-verification"
import type { User } from "../models/user"

export interface AuthGatewayPort {
  login(credentials: LoginCredentials): Promise<void>
  signUp(credentials: SignUpCredentials): Promise<void>
  resendVerificationEmail(email: string): Promise<void>
  verifyEmail(params: VerifyEmailParams): Promise<EmailVerificationResult>
  /** Invalidates the refresh-token server-side and clears auth cookies. */
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  /** Exchanges the refresh-token cookie for a new access-token cookie. */
  refreshTokens(): Promise<boolean>
  onAuthFailure(callback: () => void): () => void
}
