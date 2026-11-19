import type { User } from "@/types/api/user"

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
