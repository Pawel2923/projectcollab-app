import { translateSymfonyValidation } from "@/services/message-mapper/translate-symfony-validation";

export function formatValidationErrors(
  violations?: Array<{ propertyPath: string; message: string; code?: string }>,
): Record<string, string[]> {
  if (!violations) return {};

  return violations.reduce(
    (acc, violation) => {
      const path = violation.propertyPath || "form";
      if (!acc[path]) {
        acc[path] = [];
      }
      // Translate Symfony validation message to Polish
      const translatedMessage = translateSymfonyValidation(
        violation.message,
        violation.code,
        violation.propertyPath, // Pass property path for context-specific translations
      );
      acc[path].push(translatedMessage);
      return acc;
    },
    {} as Record<string, string[]>,
  );
}
