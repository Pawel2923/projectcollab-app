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
      typeof item.propertyPath === "string" &&
      typeof item.message === "string"
    ) {
      violations.push({
        propertyPath: item.propertyPath,
        message: item.message,
      })
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
    if (payload.message) {
      return payload.message
    }
    if (payload["hydra:title"]) {
      return payload["hydra:title"]
    }
  }

  return `Request failed with status ${status}`
}

export class ApiError extends Error {
  public readonly status: number
  public readonly data: unknown
  public readonly violations: readonly ApiPlatformViolation[]

  constructor(status: number, data: unknown, message?: string) {
    const resolvedMessage = message || resolveErrorMessage(status, data)
    super(resolvedMessage)
    this.name = "ApiError"
    this.status = status
    this.data = data
    this.violations = parseViolations(data)
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError
}
