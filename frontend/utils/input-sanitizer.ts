/**
 * Sanitizes input for use as a URL token or base64-encoded string.
 * Allows alphanumeric, '-', '_', '+', '/', and '=' characters.
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[^a-zA-Z0-9\-_\+\/=]/g, "");
}
