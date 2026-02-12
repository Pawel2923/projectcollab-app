import type { ErrorCode } from "@/lib/types/errors";
import type { ApiPlatformViolation } from "@/types/api/api-platform-error";

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
