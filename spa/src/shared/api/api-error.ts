import type { ApiPlatformErrorPayload, ApiPlatformViolation } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parseViolations(data: unknown): readonly ApiPlatformViolation[] {
  if (!isRecord(data) || !Array.isArray(data.violations)) {
    return []
  }

  const violations: ApiPlatformViolation[] = []
  for (const item of data.violations) {
    if (
      isRecord(item) &&
      typeof item.message === "string" &&
      (typeof item.propertyPath === "string" || item.propertyPath === undefined)
    ) {
      const propertyPath =
        typeof item.propertyPath === "string" ? item.propertyPath : ""
      const trimmedCode =
        typeof item.code === "string" ? item.code.trim() : undefined

      const violation: ApiPlatformViolation =
        trimmedCode && trimmedCode.length > 0
          ? {
              propertyPath,
              message: item.message,
              code: trimmedCode,
            }
          : {
              propertyPath,
              message: item.message,
            }

      violations.push(Object.freeze(violation))
    }
  }

  return Object.freeze(violations)
}

function resolveErrorMessage(status: number, data: unknown): string {
  if (isRecord(data)) {
    const payload = data as ApiPlatformErrorPayload
    if (payload["hydra:description"]) {
      return payload["hydra:description"]
    }
    if (payload.detail) {
      return payload.detail
    }
    if (payload.description) {
      return payload.description
    }
    if (payload.message) {
      return payload.message
    }
    if (payload["hydra:title"]) {
      return payload["hydra:title"]
    }
  }

  return `Request failed with status ${status}`
}

export interface ApiError {
  readonly name: "ApiError"
  readonly message: string
  readonly status: number
  readonly data: unknown
  readonly violations: readonly ApiPlatformViolation[]
}

export function createApiError(
  status: number,
  data: unknown,
  message?: string
): ApiError {
  const resolvedMessage = message || resolveErrorMessage(status, data)
  return Object.freeze({
    name: "ApiError",
    message: resolvedMessage,
    status,
    data,
    violations: parseViolations(data),
  })
}

export function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    value.name === "ApiError" &&
    typeof value.status === "number" &&
    typeof value.message === "string" &&
    Array.isArray(value.violations)
  )
}
