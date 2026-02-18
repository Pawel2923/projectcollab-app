import { parseApiPlatformError } from "@/services/error/api-platform-error-parser";
import { AppError } from "@/services/error/app-error";
import { logError } from "@/services/error/error-logger";
import { isApiPlatformError } from "@/types/error/api-platform-error";
import type { ErrorCode } from "@/types/error/error-code";

export function handleApiError(
  error: unknown,
  context: string = "API call",
): {
  ok: false;
  code: ErrorCode;
  status: number;
  message?: string;
  violations?: Array<{ propertyPath: string; message: string }>;
} {
  if (error instanceof AppError) {
    logError(error);
    return {
      ok: false,
      code: error.code,
      status: error.status,
      message: error.message,
      violations: error.violations,
    };
  }

  if (isApiPlatformError(error)) {
    const appError = parseApiPlatformError(error, context);
    logError(appError);
    return {
      ok: false,
      code: appError.code,
      status: appError.status,
      message: appError.message,
      violations: error.violations,
    };
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
    return {
      ok: false,
      code,
      status: 503,
      message: appError.message,
    };
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
    return {
      ok: false,
      code,
      status: 408,
      message: appError.message,
    };
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
  return {
    ok: false,
    code,
    status: 500,
    message: appError.message,
  };
}
