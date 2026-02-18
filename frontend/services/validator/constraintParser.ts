import type { Constraint } from "./types/constraintTypes";

export function isConstraint(object?: object): object is Constraint {
  return (
    typeof object === "object" &&
    object !== null &&
    "@id" in object &&
    "@type" in object &&
    "@context" in object &&
    "status" in object &&
    "type" in object &&
    "title" in object &&
    "description" in object &&
    "detail" in object &&
    "violations" in object &&
    Array.isArray(object.violations)
  );
}
