import { parseApiPlatformError } from "@/services/error/api-platform-error-parser";
import { AppError } from "@/services/error/app-error";
import { mapStatusToErrorCode } from "@/services/error/map-error-code";
import {
  getMessageText,
  getMessageTitle,
} from "@/services/message-mapper/message-mapper";
import { isApiPlatformError } from "@/types/error/api-platform-error";

export async function createErrorFromResponse(
  response: Response,
  context: string,
): Promise<AppError> {
  try {
    const data = await response.json();
    if (isApiPlatformError(data)) {
      return parseApiPlatformError(data, context);
    }

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
          getMessageTitle(code) ||
          code,
        code,
        status: response.status,
        context,
        originalError: data,
      });
    }
  } catch {
    // Could not parse JSON
  }
  if (response.status === 401) {
    // If we can't distinguish, we might default to UNAUTHORIZED,
    // but if it's a login endpoint, it might be INVALID_CREDENTIALS.
    // For now, keep it safe as UNAUTHORIZED unless we know better.
  }

  const code = mapStatusToErrorCode(response.status);
  return new AppError({
    message: response.statusText || getMessageTitle(code) || code,
    code,
    status: response.status,
    context,
  });
}
