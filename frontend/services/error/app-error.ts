import type { ApiPlatformViolation } from "@/types/error/api-platform-error";
import type { ErrorCode } from "@/types/error/error-code";

type ErrorSeverity = "error" | "warning" | "info";

/**
 * Application error class with enhanced metadatas
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
