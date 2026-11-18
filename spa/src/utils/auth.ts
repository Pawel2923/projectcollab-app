import type { User } from "@/types/api/user"

/**
 * Initiates logout by calling the auth logout API endpoint and redirecting the user.
 */
export async function logout(): Promise<void> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    })

    if (!response.ok) {
      return
    }

    const data = await response.json().catch(() => ({}))
    window.location.href = data.redirect || "/signin"
  } catch (error) {
    console.error("Logout failed", error)
  }
}

/**
 * Returns the display name of the user, preferring username and falling back to email.
 */
export function getUserDisplayName(user?: User | null): string {
  return user?.username || user?.email || ""
}

/**
 * Returns a friendly greeting for the user based on their username or email.
 */
export function getUserGreeting(user?: User | null): string {
  const name = getUserDisplayName(user)
  return name ? `Cześć ${name}` : ""
}
