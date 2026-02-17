import type { ErrorCode } from "@/types/error/error-code";

export const errorCodesMap: Record<number, ErrorCode> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  408: "TIMEOUT_ERROR",
  409: "CONFLICT",
  413: "FILE_TOO_LARGE",
  422: "VALIDATION_ERROR",
  500: "INTERNAL_SERVER_ERROR",
  503: "NETWORK_ERROR",
} as const;
