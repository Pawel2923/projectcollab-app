const INVALID_REDIRECT_URLS: readonly string[] = Object.freeze([
  "/",
  "/email-verified",
  "/logout",
  "/signin",
  "/signup",
  "/verify-email",
  "/reset-password",
  "/reset-password/form",
  "/reset-password/sent",
  "/verify-email/verify",
])

export const DEFAULT_POST_LOGIN_REDIRECT = "/organizations"

/**
 * Returns a safe, validated application redirect path after successful sign in.
 * Filters out external redirects, protocol-relative paths, and auth loop destinations.
 */
export function getPostLoginRedirect(redirectUrl?: string | null): string {
  if (!redirectUrl || typeof redirectUrl !== "string") {
    return DEFAULT_POST_LOGIN_REDIRECT
  }

  const trimmed = redirectUrl.trim()
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    INVALID_REDIRECT_URLS.includes(trimmed)
  ) {
    return DEFAULT_POST_LOGIN_REDIRECT
  }

  return trimmed
}
