import type { Constraint } from "./types/constraintTypes";

export function parseConstraint(jsonString?: string | null): Constraint | null {
  try {
    if (!jsonString) {
      return null;
    }

    const constraint = JSON.parse(jsonString);

    if (!isConstraint(constraint)) {
      console.error("Parsed object is not a valid Constraint");
      return null;
    }

    if (constraint.status !== 422) {
      console.error(`Unsupported status: ${constraint.status}`);
      return null;
    }

    return constraint;
  } catch (error) {
    console.error(`Error parsing JSON: ${error}`);
    return null;
  }
}

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
