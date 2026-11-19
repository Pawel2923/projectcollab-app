import {
  apiClient,
  apiFetch,
  onAuthFailure,
  refreshTokens,
  type AuthFailureCallback,
} from "@/lib/api-client"
import { queryClient } from "@/lib/queryClient"
import type { LoginCredentials } from "@/types/api/auth"
import type { User } from "@/types/api/user"

export class AuthService {
  /**
   * Logs in with user credentials.
   * Symfony sets HttpOnly JWT and refresh cookies on successful response.
   */
  public async login(credentials: LoginCredentials): Promise<void> {
    await apiFetch("/core-api/auth/login", {
      method: "POST",
      body: credentials,
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
    await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
  }

  /**
   * Logs out from Symfony backend, purges query cache, and redirects.
   */
  public async logout(): Promise<void> {
    try {
      await apiFetch("/core-api/auth/logout", {
        method: "POST",
        body: {},
        skipAuthRefresh: true,
        skipAuthRedirect: true,
      })
    } catch (error: unknown) {
      console.warn(
        "Backend logout request failed, proceeding with local cleanup",
        error
      )
    } finally {
      queryClient.clear()
      if (typeof window !== "undefined") {
        window.location.href = "/signin"
      }
    }
  }

  /**
   * Fetches the currently authenticated user from Symfony.
   * Returns null if unauthenticated without triggering an error redirection.
   */
  public async fetchCurrentUser(): Promise<User | null> {
    try {
      return await apiClient.get<User>("/core-api/users/me", {
        skipAuthRedirect: true,
      })
    } catch {
      return null
    }
  }

  /**
   * Dispatches a silent token refresh request to Symfony.
   */
  public async refreshTokens(): Promise<boolean> {
    return refreshTokens()
  }

  /**
   * Subscribes to authentication failure events (e.g. session expiration).
   */
  public onAuthFailure(callback: AuthFailureCallback): () => void {
    return onAuthFailure(callback)
  }
}

export const authService = new AuthService()
