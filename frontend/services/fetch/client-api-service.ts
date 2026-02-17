import type { AppError } from "@/services/error/app-error";
import { toErrorResult } from "@/services/error/app-error-to-result";
import { Ok, type Result } from "@/utils/result";

interface ClientApiCallOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: object;
  headers?: Record<string, string>;
}

/**
 * Client-side API call utility
 * Returns Result<T, AppError> instead of throwing
 */
export async function clientApiCall<T = unknown>(
  endpoint: string,
  options: ClientApiCallOptions = {},
): Promise<Result<T, AppError>> {
  const { method = "GET", body, headers = {} } = options;

  try {
    const response = await fetch(
      `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return toErrorResult(data, `${method} ${endpoint}`);
    }

    return Ok(data as T);
  } catch (error) {
    return toErrorResult(error, `${method} ${endpoint}`);
  }
}

export async function clientApiGet<T = unknown>(
  endpoint?: string,
): Promise<Result<T, AppError>> {
  if (!endpoint) {
    return toErrorResult("Invalid endpoint", "GET undefined");
  }

  return clientApiCall<T>(endpoint, { method: "GET" });
}
