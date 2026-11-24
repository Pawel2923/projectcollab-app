import { m } from "@/paraglide/messages"
import { isApiError } from "./api-error"
import {
  SYMFONY_VIOLATION_CODES,
  SYMFONY_VIOLATION_MESSAGE_MAP,
} from "./symfony-violation-codes"
import type { ApiPlatformViolation } from "./types"

export interface MappedViolation {
  readonly field: string
  readonly message: string
}

export interface MappedValidationResult {
  readonly fieldErrors: Readonly<Record<string, readonly string[]>>
  readonly formErrors: readonly string[]
  readonly violations: readonly MappedViolation[]
  readonly summary: string
}

export interface MapViolationsOptions {
  readonly fieldMap?: Readonly<Record<string, string>>
  readonly allowedFields?: readonly string[]
}

const DUPLICATE_VALUE_PATTERNS = [
  "already used",
  "already exists",
  "already in use",
  "już istnieje",
  "już używana",
]

function normalizeCode(code?: string): string | undefined {
  if (typeof code !== "string") {
    return undefined
  }
  const normalized = code.trim().toLowerCase()
  return normalized.length > 0 ? normalized : undefined
}

function getLeafFieldName(propertyPath: string): string {
  const trimmed = propertyPath.trim()
  if (!trimmed) {
    return ""
  }
  const segments = trimmed.split(".")
  return (segments[segments.length - 1] ?? "").toLowerCase()
}

function includesAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some((needle) => haystack.includes(needle))
}

function resolveContextSpecificMessage(
  leafField: string,
  lowerMessage: string,
  code?: string
): string | null {
  if (
    leafField === "email" &&
    (code === SYMFONY_VIOLATION_CODES.UNIQUE_ENTITY_NOT_UNIQUE ||
      includesAny(lowerMessage, DUPLICATE_VALUE_PATTERNS))
  ) {
    return m.validation_unique_email()
  }

  if (
    leafField === "username" &&
    (code === SYMFONY_VIOLATION_CODES.UNIQUE_ENTITY_NOT_UNIQUE ||
      includesAny(lowerMessage, DUPLICATE_VALUE_PATTERNS))
  ) {
    return m.validation_unique_username()
  }

  if (
    leafField.includes("estimated") ||
    leafField.includes("loggedtime") ||
    leafField.includes("logged")
  ) {
    if (
      code === SYMFONY_VIOLATION_CODES.TYPE_INVALID_TYPE ||
      includesAny(lowerMessage, [
        "not a valid",
        "not an integer",
        "of type integer",
        "liczbą całkowitą",
      ])
    ) {
      return leafField.includes("logged")
        ? m.validation_invalid_logged_time_format()
        : m.validation_invalid_time_format()
    }

    if (
      code === SYMFONY_VIOLATION_CODES.GREATER_THAN_OR_EQUAL_TOO_LOW ||
      includesAny(lowerMessage, [
        "positive or zero",
        "non-negative",
        "nieujemną",
        "not be negative",
      ])
    ) {
      return m.validation_time_non_negative()
    }
  }

  if (
    leafField === "startdate" &&
    (code === SYMFONY_VIOLATION_CODES.GREATER_THAN_OR_EQUAL_TOO_LOW ||
      lowerMessage.includes("in the past"))
  ) {
    return m.validation_start_date_in_past()
  }

  if (
    leafField === "enddate" &&
    (code === SYMFONY_VIOLATION_CODES.GREATER_THAN_TOO_LOW ||
      lowerMessage.includes("after start date"))
  ) {
    return m.validation_end_date_before_start()
  }

  if (
    code === SYMFONY_VIOLATION_CODES.GREATER_THAN_TOO_LOW &&
    lowerMessage.includes("should be positive")
  ) {
    return m.validation_must_be_positive()
  }

  if (
    code === SYMFONY_VIOLATION_CODES.GREATER_THAN_OR_EQUAL_TOO_LOW &&
    lowerMessage.includes("either positive or zero")
  ) {
    return m.validation_must_be_non_negative()
  }

  if (
    code === SYMFONY_VIOLATION_CODES.LESS_THAN_TOO_HIGH &&
    lowerMessage.includes("should be negative")
  ) {
    return m.validation_must_be_negative()
  }

  if (
    code === SYMFONY_VIOLATION_CODES.LESS_THAN_OR_EQUAL_TOO_HIGH &&
    lowerMessage.includes("either negative or zero")
  ) {
    return m.validation_must_be_non_positive()
  }

  return null
}

function resolveMessagePatternFallback(lowerMessage: string): string | null {
  if (
    includesAny(lowerMessage, [
      "should not be blank",
      "field is required",
      "is required",
    ])
  ) {
    return m.validation_not_blank()
  }

  if (lowerMessage.includes("should not be null")) {
    return m.validation_not_null()
  }

  if (lowerMessage.includes("not a valid email")) {
    return m.validation_invalid_email()
  }

  if (
    includesAny(lowerMessage, [
      "leaked in a data breach",
      "compromised password",
    ])
  ) {
    return m.validation_compromised_password()
  }

  if (lowerMessage.includes("password strength")) {
    return m.validation_password_too_weak()
  }

  if (
    includesAny(lowerMessage, [
      "passwords do not match",
      "password confirmation does not match",
    ])
  ) {
    return m.validation_passwords_do_not_match()
  }

  if (lowerMessage.includes("too short")) {
    return m.validation_too_short()
  }

  if (lowerMessage.includes("too long")) {
    return m.validation_too_long()
  }

  if (includesAny(lowerMessage, DUPLICATE_VALUE_PATTERNS)) {
    return m.validation_unique_value()
  }

  if (lowerMessage.includes("not a valid url")) {
    return m.validation_invalid_url()
  }

  if (lowerMessage.includes("either positive or zero")) {
    return m.validation_must_be_non_negative()
  }

  if (lowerMessage.includes("should be positive")) {
    return m.validation_must_be_positive()
  }

  if (lowerMessage.includes("either negative or zero")) {
    return m.validation_must_be_non_positive()
  }

  if (lowerMessage.includes("should be negative")) {
    return m.validation_must_be_negative()
  }

  if (lowerMessage.includes("or more")) {
    return m.validation_value_too_small()
  }

  if (lowerMessage.includes("or less")) {
    return m.validation_value_too_large()
  }

  return null
}

/**
 * Translates a single API Platform / Symfony constraint violation into a user-safe,
 * localized Paraglide message without exposing violation codes or raw technical details.
 */
export function translateSymfonyViolation(
  violation: ApiPlatformViolation
): string {
  const propertyPath = violation.propertyPath.trim()
  const leafField = getLeafFieldName(propertyPath)
  const lowerMessage = violation.message.toLowerCase()
  const code = normalizeCode(violation.code)

  const contextual = resolveContextSpecificMessage(
    leafField,
    lowerMessage,
    code
  )
  if (contextual !== null) {
    return contextual
  }

  if (code) {
    const codeResolver = SYMFONY_VIOLATION_MESSAGE_MAP[code]
    if (codeResolver) {
      return codeResolver()
    }
  }

  const patternFallback = resolveMessagePatternFallback(lowerMessage)
  if (patternFallback !== null) {
    return patternFallback
  }

  return propertyPath.length > 0
    ? m.validation_invalid_value()
    : m.validation_invalid_form()
}

function resolveTargetField(
  propertyPath: string,
  fieldMap?: Readonly<Record<string, string>>
): string {
  const trimmed = propertyPath.trim()
  if (!trimmed) {
    return ""
  }
  return fieldMap?.[trimmed] ?? trimmed
}

/**
 * Maps a single API Platform violation to a `{ field, message }` entry.
 */
export function mapApiPlatformViolation(
  violation: ApiPlatformViolation,
  fieldMap?: Readonly<Record<string, string>>
): MappedViolation {
  return Object.freeze({
    field: resolveTargetField(violation.propertyPath, fieldMap),
    message: translateSymfonyViolation(violation),
  })
}

/**
 * Maps an array of API Platform violations into grouped field errors, form-level errors,
 * a flat deduplicated list, and a summary message.
 */
export function mapApiPlatformViolations(
  violations: readonly ApiPlatformViolation[],
  options: MapViolationsOptions = {}
): MappedValidationResult {
  const allowedFieldSet = options.allowedFields
    ? new Set(options.allowedFields)
    : null

  const mutableFieldErrors: Record<string, string[]> = {}
  const mutableFormErrors: string[] = []
  const mappedViolations: MappedViolation[] = []

  for (const rawViolation of violations) {
    const mapped = mapApiPlatformViolation(rawViolation, options.fieldMap)
    const isFieldAllowed =
      mapped.field.length > 0 &&
      (allowedFieldSet === null || allowedFieldSet.has(mapped.field))

    if (isFieldAllowed) {
      const existing = mutableFieldErrors[mapped.field] ?? []
      if (!existing.includes(mapped.message)) {
        existing.push(mapped.message)
        mutableFieldErrors[mapped.field] = existing
        mappedViolations.push(mapped)
      }
    } else if (!mutableFormErrors.includes(mapped.message)) {
      mutableFormErrors.push(mapped.message)
      mappedViolations.push(
        Object.freeze({
          field: "",
          message: mapped.message,
        })
      )
    }
  }

  const frozenFieldErrors: Record<string, readonly string[]> = {}
  for (const [field, messages] of Object.entries(mutableFieldErrors)) {
    frozenFieldErrors[field] = Object.freeze(messages)
  }

  const frozenFormErrors = Object.freeze(mutableFormErrors)
  const frozenViolations = Object.freeze(mappedViolations)
  const summary =
    frozenFormErrors[0] ??
    frozenViolations[0]?.message ??
    m.validation_invalid_form()

  return Object.freeze({
    fieldErrors: Object.freeze(frozenFieldErrors),
    formErrors: frozenFormErrors,
    violations: frozenViolations,
    summary,
  })
}

/**
 * Maps an unknown caught error into a `MappedValidationResult` when it represents
 * an HTTP `422 Unprocessable Entity` `ApiError`; returns `null` for all other errors.
 */
export function mapApiPlatformValidationError(
  error: unknown,
  options: MapViolationsOptions = {}
): MappedValidationResult | null {
  if (!isApiError(error) || error.status !== 422) {
    return null
  }

  return mapApiPlatformViolations(error.violations, options)
}
