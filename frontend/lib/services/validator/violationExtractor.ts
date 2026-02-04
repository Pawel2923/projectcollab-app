import type { Constraint } from "./types/constraintTypes";
import type { FormViolation } from "./types/formViolationTypes";

export function extractViolations(
  constraint?: Constraint | null,
): FormViolation[] | null {
  if (!constraint || constraint.violations.length === 0) {
    return null;
  }
  return constraint.violations.map(
    (violation: { propertyPath: string; message: string; code: string }) => ({
      field: violation.propertyPath,
      message: violation.message,
      code: violation.code,
    }),
  );
}
