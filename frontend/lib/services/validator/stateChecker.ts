import type {
  ActionResult,
  FailedActionResult,
} from "@/actions/types/ActionResult";
import { isConstraint } from "@/lib/services/validator/constraintParser";

import type { Constraint } from "./types/constraintTypes";

export function isUnprocessableEntityErrorWithConstraint(
  actionState?: ActionResult | null,
): actionState is FailedActionResult<Constraint> {
  return (
    !actionState?.ok &&
    actionState?.status === 422 &&
    actionState?.errors !== undefined &&
    isConstraint(actionState?.errors)
  );
}

export function isUnprocessableEntityErrorWithViolations(
  actionState?: ActionResult | null,
): actionState is FailedActionResult {
  return (
    !actionState?.ok &&
    actionState?.status === 422 &&
    actionState?.violations !== undefined &&
    Array.isArray(actionState?.violations) &&
    actionState.violations.length > 0
  );
}

export function isOtherClientError(
  actionState?: ActionResult | null,
): actionState is FailedActionResult {
  return (
    actionState !== null &&
    actionState !== undefined &&
    !actionState.ok &&
    actionState.status !== undefined &&
    actionState.status >= 400 &&
    actionState.status !== 422
  );
}
