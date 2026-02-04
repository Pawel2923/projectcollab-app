import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  ActionResult,
  FailedActionResult,
} from "@/actions/types/ActionResult";
import {
  isOtherClientError,
  isUnprocessableEntityErrorWithConstraint,
  isUnprocessableEntityErrorWithViolations,
} from "@/lib/services/validator/stateChecker";
import type { Constraint } from "@/lib/services/validator/types/constraintTypes";
import type { FormViolation } from "@/lib/services/validator/types/formViolationTypes";
import { extractViolations } from "@/lib/services/validator/violationExtractor";
import { messageMap } from "@/lib/utils/messageMapper/messageMap";
import {
  getMessageText,
  translateSymfonyValidation,
} from "@/lib/utils/messageMapper/messageMapper";

type FieldError = { [key: string]: { isInvalid: boolean; message: string } };

export type ServerErrors = FieldError & {
  form?: {
    isInvalid: boolean;
    message: string;
  };
};

/**
 * A hook to manage server-side validation errors for forms.
 * @param fields - An array of field names to track for validation errors.
 * @param actionState - The result of a server action, which may contain validation errors.
 * @param serverFieldsMap - Optional mapping of server field names to client field names if they differ.
 */
export function useServerValidation(
  fields: ReadonlyArray<string>,
  actionState?: ActionResult | null,
  serverFieldsMap?: Record<string, string>,
) {
  const initialErrors = useMemo(() => getInitialErrors(fields), [fields]);
  const [serverErrors, setServerErrors] = useState<ServerErrors>(initialErrors);

  useEffect(() => {
    if (!actionState || actionState.ok) {
      return;
    }

    // Type assertion for failed action state
    const failedState = actionState as FailedActionResult;

    if (isUnprocessableEntityErrorWithConstraint(actionState)) {
      const violations =
        extractViolations(failedState.errors as Constraint) ?? [];
      addErrorsFromViolations(
        violations,
        setServerErrors,
        fields,
        serverFieldsMap,
      );
    } else if (
      failedState.code === "VALIDATION_ERROR" &&
      failedState.errors !== undefined &&
      failedState.errors !== null
    ) {
      const zodTree = failedState.errors as unknown;
      const zodViolations = zodTreeToViolations(zodTree);

      if (zodViolations.length > 0) {
        addErrorsFromViolations(
          zodViolations,
          setServerErrors,
          fields,
          serverFieldsMap,
        );
      }
    } else if (isUnprocessableEntityErrorWithViolations(actionState)) {
      // Handle violations directly from ActionResult (from API Platform)
      const violations: FormViolation[] =
        failedState.violations?.map((v) => ({
          field: v.propertyPath,
          message: v.message,
          code: v.code || "",
        })) ?? [];
      addErrorsFromViolations(
        violations,
        setServerErrors,
        fields,
        serverFieldsMap,
      );
    } else if (isOtherClientError(actionState)) {
      // Try to get translated message from messageMap first
      const mapped = messageMap[failedState.code];
      const translatedMessage = mapped
        ? mapped.description || mapped.title
        : null;

      // Use translated message if available, otherwise use server message or fallback
      const message =
        translatedMessage ||
        failedState.message ||
        getMessageText(failedState.code);

      setServerErrors((prev) => ({
        ...prev,
        form: {
          isInvalid: true,
          message,
        },
      }));
    }
  }, [actionState, fields, serverFieldsMap]);

  const clearServerErrors = useCallback(() => {
    setServerErrors(initialErrors);
  }, [initialErrors]);

  return {
    serverErrors,
    setServerErrors,
    clearServerErrors,
  };
}

/**
 * Convert a Zod error tree (z.treeifyError output) into an array of FormViolation objects.
 *
 * Handles Zod's treeifyError structure:
 * - { errors: ['msg'], properties: { field: { errors: ['msg'] } } }
 */
function zodTreeToViolations(
  tree: unknown,
  prefix: string = "",
): FormViolation[] {
  const violations: FormViolation[] = [];

  if (tree === null || tree === undefined) return violations;

  if (typeof tree === "object" && !Array.isArray(tree)) {
    const obj = tree as Record<string, unknown>;

    // Handle root-level or field-level 'errors' array
    if (Array.isArray(obj.errors)) {
      (obj.errors as unknown[]).forEach((msg) => {
        if (typeof msg === "string") {
          violations.push({ field: prefix || "form", message: msg, code: "" });
        }
      });
    }

    // Handle 'properties' object containing nested field errors
    if (obj.properties && typeof obj.properties === "object") {
      const properties = obj.properties as Record<string, unknown>;
      Object.keys(properties).forEach((fieldName) => {
        const fieldErrors = properties[fieldName];
        const newPrefix = prefix ? `${prefix}.${fieldName}` : fieldName;
        violations.push(...zodTreeToViolations(fieldErrors, newPrefix));
      });
    }
  }

  return violations;
}

function getInitialErrors(fields: ReadonlyArray<string>): ServerErrors {
  const errors = fields.reduce((acc, field) => {
    acc[field] = { isInvalid: false, message: "" };
    return acc;
  }, {} as FieldError);

  return {
    ...errors,
    form: { isInvalid: false, message: "" },
  };
}

function addErrorsFromViolations(
  violations: FormViolation[],
  setServerErrors: React.Dispatch<React.SetStateAction<ServerErrors>>,
  fields: ReadonlyArray<string>,
  serverFieldsMap?: Record<string, string>,
) {
  violations.forEach((violation) => {
    const mappedField = serverFieldsMap?.[violation.field];
    if (mappedField && !fields.includes(mappedField)) {
      console.error(
        `Incorrect mapping: "${violation.field}" is mapped to "${mappedField}", which is not in the tracked fields. Ensure the mapped field is included in the fields array or change mapping configuration.`,
      );
    }

    const fieldName = mappedField || violation.field;

    if (fields.includes(fieldName)) {
      const translatedMessage = translateSymfonyValidation(
        violation.message,
        violation.code,
        violation.field,
      );

      setServerErrors((prev) => ({
        ...prev,
        [fieldName]: {
          isInvalid: true,
          message: translatedMessage,
        },
      }));
    }
  });
}
