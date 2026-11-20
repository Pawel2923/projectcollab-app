import type { LoginCredentials } from "../models/credentials"
import type { User } from "../models/user"

export interface AuthGatewayPort {
  login(credentials: LoginCredentials): Promise<void>
  logout(refreshToken?: string): Promise<void>
  getCurrentUser(): Promise<User | null>
  refreshTokens(): Promise<boolean>
  onAuthFailure(callback: () => void): () => void
}
