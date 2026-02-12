import type { ApiPlatformViolation } from "@/types/api/api-platform-error";

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

export type ErrorSeverity = "error" | "warning" | "info";

/**
 * Application error class with enhanced metadata
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly severity: ErrorSeverity;
  readonly context?: string;
  readonly originalError?: unknown;
  readonly timestamp: Date;
  readonly violations?: ApiPlatformViolation[];

  constructor(config: {
    message: string;
    code: ErrorCode;
    status: number;
    severity?: ErrorSeverity;
    context?: string;
    originalError?: unknown;
    violations?: ApiPlatformViolation[];
  }) {
    super(config.message);
    this.name = "AppError";
    this.code = config.code;
    this.status = config.status;
    this.severity = config.severity || "error";
    this.context = config.context;
    this.originalError = config.originalError;
    this.timestamp = new Date();
    this.violations = config.violations;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Check if error is a specific type
   */
  is(code: ErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Convert to plain object for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      violations: this.violations,
      stack: this.stack,
    };
  }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
