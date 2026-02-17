/**
 * API Platform error format (422 validation error)
 */
export interface ApiPlatformViolation {
  propertyPath: string;
  message: string;
  code?: string;
}

export interface ApiPlatformError {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  status: number;
  violations?: ApiPlatformViolation[];
  detail?: string;
  description?: string;
  type?: string;
  title?: string;
  instance?: string;
  message?: string;
  error?: string;
}

/**
 * Type guard to check if error is API Platform error
 */
export function isApiPlatformError(error: unknown): error is ApiPlatformError {
  return typeof error === "object" && error !== null && "status" in error;
}
