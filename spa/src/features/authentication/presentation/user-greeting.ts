import { m } from "@/paraglide/messages"
import type { UserLike } from "../domain/models/user"
import { getUserDisplayName } from "../domain/services/user-display"

/**
 * Returns a localized friendly greeting for the user based on their username or email.
 */
export function getUserGreeting(user?: UserLike | null): string {
  const name = getUserDisplayName(user)
  return name ? m.user_greeting({ name }) : ""
}
