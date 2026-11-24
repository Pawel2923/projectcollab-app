import type {
  VerifyEmailParams,
  VerifyEmailSearchParams,
} from "../models/email-verification"

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/

function toNonEmptyString(
  value: unknown,
  allowFiniteNumber: boolean
): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  if (
    allowFiniteNumber &&
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return String(value)
  }
  return undefined
}

export function normalizeVerifyEmailSearchParams(
  search: Record<string, unknown>
): VerifyEmailSearchParams {
  return {
    id: toNonEmptyString(search.id, true),
    expires: toNonEmptyString(search.expires, true),
    signature: toNonEmptyString(search.signature, false),
    token: toNonEmptyString(search.token, false),
  }
}

export function parseVerifyEmailParams(
  raw: VerifyEmailSearchParams | Record<string, unknown>
): VerifyEmailParams | null {
  const normalized = normalizeVerifyEmailSearchParams(
    raw as Record<string, unknown>
  )

  const { id, expires, signature, token } = normalized
  if (!id || !expires || !signature || !token) {
    return null
  }

  if (
    !POSITIVE_INTEGER_PATTERN.test(id) ||
    !POSITIVE_INTEGER_PATTERN.test(expires)
  ) {
    return null
  }

  return Object.freeze({
    id,
    expires,
    signature,
    token,
  })
}

export function getVerifyEmailKey(params: VerifyEmailParams): string {
  return JSON.stringify([
    params.id,
    params.expires,
    params.signature,
    params.token,
  ])
}
