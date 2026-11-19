import { authService } from "@/services/auth-service"

export { getUserDisplayName, getUserGreeting } from "@/utils/user-display"

/**
 * Initiates logout by calling the Symfony auth logout endpoint,
 * clearing the TanStack Query cache, and redirecting to the sign-in page.
 */
export async function logout(): Promise<void> {
  await authService.logout()
}
