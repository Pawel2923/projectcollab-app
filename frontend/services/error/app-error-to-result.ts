import { parseApiPlatformError } from "@/services/error/api-platform-error-parser";
import { AppError } from "@/services/error/app-error";
import { logError } from "@/services/error/error-logger";
import { isApiPlatformError } from "@/types/error/api-platform-error";
import type { Result } from "@/utils/result";
import { Err } from "@/utils/result";

/**
 * Convert error to Result<never, AppError> for client-side use
 */
export function toErrorResult(
  error: unknown,
  context: string = "API call",
): Result<never, AppError> {
  if (error instanceof AppError) {
    logError(error);
    return Err(error);
  }

  if (isApiPlatformError(error)) {
    const appError = parseApiPlatformError(error, context);
    logError(appError);
    return Err(appError);
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    const code = "NETWORK_ERROR";
    const message = code;

    const appError = new AppError({
      message,
      code,
      status: 503,
      context,
      originalError: error,
    });
    logError(appError);
    return Err(appError);
  }

  if (error instanceof Error && error.name === "AbortError") {
    const code = "TIMEOUT_ERROR";
    const message = code;

    const appError = new AppError({
      message,
      code,
      status: 408,
      context,
      originalError: error,
    });
    logError(appError);
    return Err(appError);
  }

  const code = "UNKNOWN_ERROR";

  const appError = new AppError({
    message: error instanceof Error ? error.message : code,
    code,
    status: 500,
    context,
    originalError: error,
  });
  logError(appError);
  return Err(appError);
}
