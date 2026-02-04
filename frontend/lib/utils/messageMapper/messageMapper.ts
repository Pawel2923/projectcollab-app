import type { Message } from "./messageMap";
import { messageMap, symfonyValidationMessages } from "./messageMap";

export function hasMessage(code: string): boolean {
  return code in messageMap;
}

export function mapMessage(
  code: string,
  overrides?: Record<string, Message>,
  fallback = "Nieoczekiwany błąd",
) {
  return overrides?.[code] ?? messageMap[code] ?? fallback;
}

/**
 * Get the user-facing message (description or title) from a message code
 */
export function getMessageText(code: string): string {
  const mapped = mapMessage(code);
  if (typeof mapped === "object") {
    return mapped.description || mapped.title;
  }
  return "Wystąpił nieoczekiwany błąd";
}

/**
 * Get the title from a message code
 */
export function getMessageTitle(code: string): string {
  const mapped = mapMessage(code);
  if (typeof mapped === "object" && "title" in mapped) {
    return mapped.title;
  }
  return "Error";
}

/**
 * Translate Symfony validation message to Polish
 * @param message - Original validation message from API
 * @param code - Symfony constraint violation code (UUID)
 * @param propertyPath - Optional property path to provide context-specific translations
 * @returns Translated message in Polish
 */
export function translateSymfonyValidation(
  message: string,
  code?: string,
  propertyPath?: string,
): string {
  const lowerMessage = message.toLowerCase();

  // Handle context-specific translations based on field name and message content
  if (propertyPath) {
    const lowerPath = propertyPath.toLowerCase();

    // Time fields: provide friendly format-related messages in Polish
    if (
      lowerPath.includes("estimated") ||
      lowerPath.includes("loggedtime") ||
      lowerPath.includes("logged")
    ) {
      if (
        lowerMessage.includes("not a valid") ||
        lowerMessage.includes("not an integer") ||
        lowerMessage.includes("not a valid number") ||
        lowerMessage.includes("integer") ||
        lowerMessage.includes("is not valid") ||
        lowerMessage.includes("is not a valid")
      ) {
        if (lowerPath.includes("logged")) {
          return 'Nieprawidłowy format zarejestrowanego czasu. Użyj: 1w 2d 3h 4m (np. "3h 30m").';
        }

        return 'Nieprawidłowy format czasu. Użyj: 1w 2d 3h 4m (np. "3h 30m").';
      }

      if (
        lowerMessage.includes("should be positive") ||
        lowerMessage.includes("should be greater than or equal") ||
        lowerMessage.includes("must be non-negative") ||
        lowerMessage.includes("should be at least") ||
        lowerMessage.includes("positive") ||
        lowerMessage.includes("not be negative")
      ) {
        return "Czas musi być liczbą nieujemną (minuty).";
      }
    }

    // Email field with "already used" or unique constraint
    if (
      (lowerPath.includes("email") || lowerPath === "email") &&
      (lowerMessage.includes("already used") ||
        lowerMessage.includes("already exists") ||
        code === "23bd9dbf-6b9b-41cd-a99e-4844bcf3077f")
    ) {
      return getMessageText("DUPLICATE_EMAIL");
    }

    // Username field with "already used" or unique constraint
    if (
      (lowerPath.includes("username") || lowerPath === "username") &&
      (lowerMessage.includes("already used") ||
        lowerMessage.includes("already exists") ||
        code === "23bd9dbf-6b9b-41cd-a99e-4844bcf3077f")
    ) {
      return getMessageText("DUPLICATE_USERNAME");
    }
  }

  // If we have a code and a translation for it, use it
  if (code && symfonyValidationMessages[code]) {
    return symfonyValidationMessages[code];
  }

  // Try to match common English patterns and translate them

  // Common patterns
  if (
    lowerMessage.includes("this value should not be blank") ||
    lowerMessage.includes("this value should not be null") ||
    lowerMessage.includes("this field is required")
  ) {
    return getMessageText("VALUE_REQUIRED");
  }

  if (lowerMessage.includes("this value is not a valid email")) {
    return getMessageText("INVALID_EMAIL");
  }

  if (lowerMessage.includes("this value is too short")) {
    return getMessageText("VALUE_TOO_SHORT");
  }

  if (lowerMessage.includes("this value is too long")) {
    return getMessageText("VALUE_TOO_LONG");
  }

  // Generic "already used" - only if not caught by context-specific checks above
  if (
    lowerMessage.includes("this value is already used") ||
    lowerMessage.includes("already exists")
  ) {
    return getMessageText("CONFLICT");
  }

  if (lowerMessage.includes("invalid credentials")) {
    return getMessageText("INVALID_CREDENTIALS");
  }

  if (
    lowerMessage.includes("passwords do not match") ||
    lowerMessage.includes("password confirmation does not match")
  ) {
    return getMessageText("PASSWORDS_DO_NOT_MATCH");
  }

  if (lowerMessage.includes("this value is not a valid url")) {
    return getMessageText("INVALID_URL");
  }

  if (lowerMessage.includes("this value should be positive")) {
    return "Wartość powinna być dodatnia.";
  }

  if (
    lowerMessage.includes("this value should be") &&
    lowerMessage.includes("or more")
  ) {
    return "Wartość jest zbyt mała.";
  }

  if (
    lowerMessage.includes("this value should be") &&
    lowerMessage.includes("or less")
  ) {
    return "Wartość jest zbyt duża.";
  }

  // If no translation found, return original message
  return message;
}
