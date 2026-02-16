import type { Message } from "@/constants/messages-map";
import { messagesMap } from "@/constants/messages-map";

export function mapMessage(
  code: string,
  overrides?: Record<string, Message>,
  fallback = "Nieoczekiwany błąd",
) {
  return overrides?.[code] ?? messagesMap[code] ?? fallback;
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
