import type { UserLike } from "../models/user"

/**
 * Generates user's initials based on username or email
 * @param user User or user-like object
 * @returns First letter of username or email in uppercase; "U" if neither is present
 */
export function generateUserInitials(user?: UserLike | null): string {
  return (
    user?.username?.slice(0, 1).toUpperCase() ||
    user?.email?.slice(0, 1).toUpperCase() ||
    "U"
  )
}

/**
 * Returns the display name of the user, preferring username and falling back to email.
 */
export function getUserDisplayName(user?: UserLike | null): string {
  return user?.username || user?.email || ""
}
