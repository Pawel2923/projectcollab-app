import type { ApiPlatformViolation } from "@/types/error/api-platform-error";
import type { ErrorCode } from "@/types/error/error-code";

export type FailedActionResult<T = object | undefined> = {
  ok: false;
  status: number;
  code: ErrorCode;
  message?: string;
  errors?: T;
  violations?: ApiPlatformViolation[];
};

export type ActionResult<T = undefined> =
  | { ok: true }
  | { ok: true; content: T }
  | FailedActionResult;
