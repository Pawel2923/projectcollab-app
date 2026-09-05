import { isRedirectError as nextIsRedirectError } from "next/dist/client/components/redirect-error";

/**
 * Checks whether an error is a Next.js redirect error (thrown by redirect()).
 *
 * Utilizes Next.js's standard `isRedirectError` from `next/dist/client/components/redirect-error`,
 * with fallbacks for error digest and message structures across different Next.js environments and versions.
 */
export function isRedirectError(error: unknown): boolean {
  if (typeof nextIsRedirectError === "function") {
    try {
      if (nextIsRedirectError(error)) {
        return true;
      }
    } catch {
      // Fall through to structural checks if nextIsRedirectError encounters unexpected structure
    }
  }

  if (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  ) {
    return true;
  }

  if (error instanceof Error && error.message === "NEXT_REDIRECT") {
    return true;
  }

  return false;
}

/**
 * Re-throws the error if it is a Next.js redirect error.
 * Otherwise, does nothing.
 */
export function rethrowIfRedirect(error: unknown): void {
  if (isRedirectError(error)) {
    throw error;
  }
}
