import type { ErrorCode } from "@/error/app-error";
import { AppError } from "@/error/app-error";
import { Err, type Result } from "@/error/result";
import {
  getMessageText,
  getMessageTitle,
} from "@/services/message-mapper/message-mapper";
import { translateSymfonyValidation } from "@/services/message-mapper/translate-symfony-validation";
import type { ApiPlatformError } from "@/types/api/api-platform-error";
import { isApiPlatformError } from "@/types/api/api-platform-error";

/**
 * Enhanced error handler for API calls
 * Returns error details in ActionResult format for server actions
 */
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

function parseApiPlatformError(
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
    getDefaultMessage(code);

  return new AppError({
    message,
    code,
    status: error.status,
    context,
    originalError: error,
    violations: error.violations,
  });
}

function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return "VALIDATION_ERROR";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 408:
      return "TIMEOUT_ERROR";
    case 409:
      return "CONFLICT";
    case 413:
      return "FILE_TOO_LARGE";
    case 422:
      return "VALIDATION_ERROR";
    case 500:
      return "INTERNAL_SERVER_ERROR";
    case 503:
      return "NETWORK_ERROR";
    default:
      return status >= 500 ? "SERVER_ERROR" : "UNKNOWN_ERROR";
  }
}

export function getDefaultMessage(code: ErrorCode): string {
  return code;
}

export function getErrorTitle(code: ErrorCode): string {
  return getMessageTitle(code);
}

function logError(error: AppError): void {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.group(
      `%c[${error.severity.toUpperCase()}] ${error.code}`,
      `color: ${error.severity === "error" ? "red" : "orange"}; font-weight: bold`,
    );
    console.log("Message:", error.message);
    console.log("Context:", error.context);
    console.log("Status:", error.status);
    console.log("Timestamp:", error.timestamp.toISOString());
    if (error.violations) {
      console.log("Violations:", error.violations);
    }
    if (error.originalError) {
      console.log("Original error:", error.originalError);
    }
    if (error.stack) {
      console.log("Stack:", error.stack);
    }
    console.groupEnd();
  } else {
    // In production, log structured data
    console.error(JSON.stringify(error.toJSON()));
  }
}

export async function createErrorFromResponse(
  response: Response,
  context: string,
): Promise<AppError> {
  try {
    const data = await response.json();
    if (isApiPlatformError(data)) {
      return parseApiPlatformError(data, context);
    }

    // Handle non-ApiPlatform JSON errors (e.g. from custom endpoints)
    if (data && typeof data === "object") {
      // Check for specific 401 cases
      if (
        response.status === 401 &&
        (data.message === "Invalid credentials." ||
          data.error === "Invalid credentials" ||
          data.message === "Invalid credentials")
      ) {
        return new AppError({
          message: getMessageText("INVALID_CREDENTIALS"),
          code: "INVALID_CREDENTIALS",
          status: 401,
          context,
          originalError: data,
        });
      }

      const code = mapStatusToErrorCode(response.status);
      return new AppError({
        message:
          data.message ||
          data.error ||
          response.statusText ||
          getDefaultMessage(code),
        code,
        status: response.status,
        context,
        originalError: data,
      });
    }
  } catch {
    // Could not parse JSON
  }

  // Handle 401 without JSON body (or parse failure)
  if (response.status === 401) {
    // If we can't distinguish, we might default to UNAUTHORIZED,
    // but if it's a login endpoint, it might be INVALID_CREDENTIALS.
    // For now, keep it safe as UNAUTHORIZED unless we know better.
  }

  const code = mapStatusToErrorCode(response.status);
  return new AppError({
    message: response.statusText || getDefaultMessage(code),
    code,
    status: response.status,
    context,
  });
}

export function formatValidationErrors(
  violations?: Array<{ propertyPath: string; message: string; code?: string }>,
): Record<string, string[]> {
  if (!violations) return {};

  return violations.reduce(
    (acc, violation) => {
      const path = violation.propertyPath || "form";
      if (!acc[path]) {
        acc[path] = [];
      }
      // Translate Symfony validation message to Polish
      const translatedMessage = translateSymfonyValidation(
        violation.message,
        violation.code,
        violation.propertyPath, // Pass property path for context-specific translations
      );
      acc[path].push(translatedMessage);
      return acc;
    },
    {} as Record<string, string[]>,
  );
}
