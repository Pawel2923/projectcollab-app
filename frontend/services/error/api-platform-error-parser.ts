import { AppError } from "@/services/error/app-error";
import { mapStatusToErrorCode } from "@/services/error/map-error-code";
import { getMessageTitle } from "@/services/message-mapper/message-mapper";
import type { ApiPlatformError } from "@/types/error/api-platform-error";

export function parseApiPlatformError(
  error: ApiPlatformError,
  context: string,
): AppError {
  let code = mapStatusToErrorCode(error.status);

  // Check for specific 401 cases
  if (
    error.status === 401 &&
    (error.message === "Invalid credentials." ||
      error.message === "Invalid credentials" ||
      error.error === "Invalid credentials")
  ) {
    code = "INVALID_CREDENTIALS";
  }

  const message =
    error.detail ||
    error.title ||
    error.description ||
    error.message ||
    error.error ||
    getMessageTitle(code) ||
    code;

  return new AppError({
    message,
    code,
    status: error.status,
    context,
    originalError: error,
    violations: error.violations,
  });
}
