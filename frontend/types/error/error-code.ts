/**
 * Centralized error types and interfaces for consistent error handling
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_CREDENTIALS"
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "SERVER_ERROR"
  | "SERVER_CONFIG_ERROR"
  | "INTERNAL_SERVER_ERROR"
  | "FILE_TOO_LARGE"
  | "UNKNOWN_ERROR";
