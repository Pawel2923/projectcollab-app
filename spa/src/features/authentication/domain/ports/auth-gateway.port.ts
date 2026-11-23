import type { LoginCredentials } from "../models/credentials"
import type { User } from "../models/user"

export interface AuthGatewayPort {
  login(credentials: LoginCredentials): Promise<void>
  /** Invalidates the refresh-token server-side and clears auth cookies. */
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  /** Exchanges the refresh-token cookie for a new access-token cookie. */
  refreshTokens(): Promise<boolean>
  onAuthFailure(callback: () => void): () => void
}
