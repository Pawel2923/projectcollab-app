import { afterEach, describe, expect, it } from "vitest"
import { baseLocale, setLocale } from "@/paraglide/runtime"
import { m } from "@/paraglide/messages"
import { createApiError } from "./api-error"
import { SYMFONY_VIOLATION_CODES } from "./symfony-violation-codes"
import {
  mapApiPlatformValidationError,
  mapApiPlatformViolation,
  mapApiPlatformViolations,
  translateSymfonyViolation,
} from "./violation-mapper"

describe("violation-mapper", () => {
  afterEach(() => {
    setLocale(baseLocale, { reload: false })
  })

  describe("translateSymfonyViolation", () => {
    const codeExpectations: ReadonlyArray<{
      readonly name: string
      readonly code: string
      readonly expectedMessage: () => string
    }> = [
      {
        name: "NotBlank",
        code: SYMFONY_VIOLATION_CODES.NOT_BLANK,
        expectedMessage: () => m.validation_not_blank(),
      },
      {
        name: "NotNull",
        code: SYMFONY_VIOLATION_CODES.NOT_NULL,
        expectedMessage: () => m.validation_not_null(),
      },
      {
        name: "Email",
        code: SYMFONY_VIOLATION_CODES.EMAIL_INVALID_FORMAT,
        expectedMessage: () => m.validation_invalid_email(),
      },
      {
        name: "Length (too short)",
        code: SYMFONY_VIOLATION_CODES.LENGTH_TOO_SHORT,
        expectedMessage: () => m.validation_too_short(),
      },
      {
        name: "Length (too long)",
        code: SYMFONY_VIOLATION_CODES.LENGTH_TOO_LONG,
        expectedMessage: () => m.validation_too_long(),
      },
      {
        name: "Length (not equal)",
        code: SYMFONY_VIOLATION_CODES.LENGTH_NOT_EQUAL,
        expectedMessage: () => m.validation_invalid_length(),
      },
      {
        name: "Length (invalid characters)",
        code: SYMFONY_VIOLATION_CODES.LENGTH_INVALID_CHARACTERS,
        expectedMessage: () => m.validation_invalid_characters(),
      },
      {
        name: "UniqueEntity",
        code: SYMFONY_VIOLATION_CODES.UNIQUE_ENTITY_NOT_UNIQUE,
        expectedMessage: () => m.validation_unique_value(),
      },
      {
        name: "NotCompromisedPassword",
        code: SYMFONY_VIOLATION_CODES.NOT_COMPROMISED_PASSWORD,
        expectedMessage: () => m.validation_compromised_password(),
      },
      {
        name: "PasswordStrength",
        code: SYMFONY_VIOLATION_CODES.PASSWORD_STRENGTH,
        expectedMessage: () => m.validation_password_too_weak(),
      },
      {
        name: "Range (too low)",
        code: SYMFONY_VIOLATION_CODES.RANGE_TOO_LOW,
        expectedMessage: () => m.validation_value_too_small(),
      },
      {
        name: "Range (too high)",
        code: SYMFONY_VIOLATION_CODES.RANGE_TOO_HIGH,
        expectedMessage: () => m.validation_value_too_large(),
      },
      {
        name: "Range (not in range)",
        code: SYMFONY_VIOLATION_CODES.RANGE_NOT_IN_RANGE,
        expectedMessage: () => m.validation_out_of_range(),
      },
      {
        name: "Range (invalid characters)",
        code: SYMFONY_VIOLATION_CODES.RANGE_INVALID_CHARACTERS,
        expectedMessage: () => m.validation_invalid_number(),
      },
      {
        name: "Choice (no such choice)",
        code: SYMFONY_VIOLATION_CODES.CHOICE_NO_SUCH_CHOICE,
        expectedMessage: () => m.validation_invalid_choice(),
      },
      {
        name: "Choice (too few)",
        code: SYMFONY_VIOLATION_CODES.CHOICE_TOO_FEW,
        expectedMessage: () => m.validation_too_few_choices(),
      },
      {
        name: "Choice (too many)",
        code: SYMFONY_VIOLATION_CODES.CHOICE_TOO_MANY,
        expectedMessage: () => m.validation_too_many_choices(),
      },
      {
        name: "Type",
        code: SYMFONY_VIOLATION_CODES.TYPE_INVALID_TYPE,
        expectedMessage: () => m.validation_invalid_type(),
      },
      {
        name: "Regex",
        code: SYMFONY_VIOLATION_CODES.REGEX_FAILED,
        expectedMessage: () => m.validation_invalid_format(),
      },
      {
        name: "DateTime (invalid format)",
        code: SYMFONY_VIOLATION_CODES.DATETIME_INVALID_FORMAT,
        expectedMessage: () => m.validation_invalid_datetime(),
      },
      {
        name: "DateTime (invalid date)",
        code: SYMFONY_VIOLATION_CODES.DATETIME_INVALID_DATE,
        expectedMessage: () => m.validation_invalid_date(),
      },
      {
        name: "DateTime (invalid time)",
        code: SYMFONY_VIOLATION_CODES.DATETIME_INVALID_TIME,
        expectedMessage: () => m.validation_invalid_time(),
      },
      {
        name: "Date (invalid format)",
        code: SYMFONY_VIOLATION_CODES.DATE_INVALID_FORMAT,
        expectedMessage: () => m.validation_invalid_date(),
      },
      {
        name: "Date (invalid date)",
        code: SYMFONY_VIOLATION_CODES.DATE_INVALID_DATE,
        expectedMessage: () => m.validation_invalid_date(),
      },
      {
        name: "GreaterThan",
        code: SYMFONY_VIOLATION_CODES.GREATER_THAN_TOO_LOW,
        expectedMessage: () => m.validation_value_too_small(),
      },
      {
        name: "GreaterThanOrEqual",
        code: SYMFONY_VIOLATION_CODES.GREATER_THAN_OR_EQUAL_TOO_LOW,
        expectedMessage: () => m.validation_value_too_small(),
      },
      {
        name: "LessThan",
        code: SYMFONY_VIOLATION_CODES.LESS_THAN_TOO_HIGH,
        expectedMessage: () => m.validation_value_too_large(),
      },
      {
        name: "LessThanOrEqual",
        code: SYMFONY_VIOLATION_CODES.LESS_THAN_OR_EQUAL_TOO_HIGH,
        expectedMessage: () => m.validation_value_too_large(),
      },
      {
        name: "EqualTo",
        code: SYMFONY_VIOLATION_CODES.EQUAL_TO_NOT_EQUAL,
        expectedMessage: () => m.validation_not_equal(),
      },
      {
        name: "NotEqualTo",
        code: SYMFONY_VIOLATION_CODES.NOT_EQUAL_TO_IS_EQUAL,
        expectedMessage: () => m.validation_value_not_allowed(),
      },
      {
        name: "Url (invalid)",
        code: SYMFONY_VIOLATION_CODES.URL_INVALID,
        expectedMessage: () => m.validation_invalid_url(),
      },
      {
        name: "Url (missing TLD)",
        code: SYMFONY_VIOLATION_CODES.URL_MISSING_TLD,
        expectedMessage: () => m.validation_invalid_url(),
      },
      {
        name: "File (not found)",
        code: SYMFONY_VIOLATION_CODES.FILE_NOT_FOUND,
        expectedMessage: () => m.validation_file_unreadable(),
      },
      {
        name: "File (not readable)",
        code: SYMFONY_VIOLATION_CODES.FILE_NOT_READABLE,
        expectedMessage: () => m.validation_file_unreadable(),
      },
      {
        name: "File (empty)",
        code: SYMFONY_VIOLATION_CODES.FILE_EMPTY,
        expectedMessage: () => m.validation_file_empty(),
      },
      {
        name: "File (too large)",
        code: SYMFONY_VIOLATION_CODES.FILE_TOO_LARGE,
        expectedMessage: () => m.validation_file_too_large(),
      },
      {
        name: "File (invalid mime type)",
        code: SYMFONY_VIOLATION_CODES.FILE_INVALID_MIME_TYPE,
        expectedMessage: () => m.validation_file_invalid_type(),
      },
      {
        name: "File (invalid extension)",
        code: SYMFONY_VIOLATION_CODES.FILE_INVALID_EXTENSION,
        expectedMessage: () => m.validation_file_invalid_type(),
      },
      {
        name: "File (filename too long)",
        code: SYMFONY_VIOLATION_CODES.FILE_FILENAME_TOO_LONG,
        expectedMessage: () => m.validation_filename_too_long(),
      },
      {
        name: "File (filename invalid chars)",
        code: SYMFONY_VIOLATION_CODES.FILE_FILENAME_INVALID_CHARACTERS,
        expectedMessage: () => m.validation_filename_invalid(),
      },
    ]

    it.each(["pl", "en"] as const)(
      "translates all predefined Symfony violation codes in locale %s without placeholders or codes",
      (locale) => {
        setLocale(locale, { reload: false })

        for (const item of codeExpectations) {
          const translated = translateSymfonyViolation({
            propertyPath: "genericField",
            message: `Technical raw message for ${item.name}`,
            code: item.code,
          })

          expect(translated, `Failed for ${item.name} (${locale})`).toBe(
            item.expectedMessage()
          )
          expect(translated).not.toContain(item.code)
          expect(translated).not.toContain("{{")
          expect(translated).not.toContain("}}")
        }
      }
    )

    it("handles uppercase and whitespace-padded Symfony violation codes", () => {
      setLocale("en", { reload: false })

      const translated = translateSymfonyViolation({
        propertyPath: "email",
        message: "Raw backend email message",
        code: `  ${SYMFONY_VIOLATION_CODES.EMAIL_INVALID_FORMAT.toUpperCase()}  `,
      })

      expect(translated).toBe(m.validation_invalid_email())
    })

    it("provides context-specific translations for email, username, time fields, and sprint dates", () => {
      setLocale("pl", { reload: false })

      expect(
        translateSymfonyViolation({
          propertyPath: "email",
          message: "User with this email already exists",
          code: SYMFONY_VIOLATION_CODES.UNIQUE_ENTITY_NOT_UNIQUE,
        })
      ).toBe(m.validation_unique_email())

      expect(
        translateSymfonyViolation({
          propertyPath: "user.username",
          message: "This value is already used.",
          code: SYMFONY_VIOLATION_CODES.UNIQUE_ENTITY_NOT_UNIQUE,
        })
      ).toBe(m.validation_unique_username())

      expect(
        translateSymfonyViolation({
          propertyPath: "estimatedTime",
          message: "This value should be of type integer.",
          code: SYMFONY_VIOLATION_CODES.TYPE_INVALID_TYPE,
        })
      ).toBe(m.validation_invalid_time_format())

      expect(
        translateSymfonyViolation({
          propertyPath: "loggedTime",
          message: "This value should be of type integer.",
          code: SYMFONY_VIOLATION_CODES.TYPE_INVALID_TYPE,
        })
      ).toBe(m.validation_invalid_logged_time_format())

      expect(
        translateSymfonyViolation({
          propertyPath: "estimatedTime",
          message: "This value should be either positive or zero.",
          code: SYMFONY_VIOLATION_CODES.GREATER_THAN_OR_EQUAL_TOO_LOW,
        })
      ).toBe(m.validation_time_non_negative())

      expect(
        translateSymfonyViolation({
          propertyPath: "startDate",
          message: "Start date cannot be in the past",
          code: SYMFONY_VIOLATION_CODES.GREATER_THAN_OR_EQUAL_TOO_LOW,
        })
      ).toBe(m.validation_start_date_in_past())

      expect(
        translateSymfonyViolation({
          propertyPath: "endDate",
          message: "End date must be after start date",
          code: SYMFONY_VIOLATION_CODES.GREATER_THAN_TOO_LOW,
        })
      ).toBe(m.validation_end_date_before_start())
    })

    it("disambiguates Positive, PositiveOrZero, Negative, and NegativeOrZero on shared comparison UUID codes", () => {
      setLocale("en", { reload: false })

      expect(
        translateSymfonyViolation({
          propertyPath: "points",
          message: "This value should be positive.",
          code: SYMFONY_VIOLATION_CODES.GREATER_THAN_TOO_LOW,
        })
      ).toBe(m.validation_must_be_positive())

      expect(
        translateSymfonyViolation({
          propertyPath: "points",
          message: "This value should be either positive or zero.",
          code: SYMFONY_VIOLATION_CODES.GREATER_THAN_OR_EQUAL_TOO_LOW,
        })
      ).toBe(m.validation_must_be_non_negative())

      expect(
        translateSymfonyViolation({
          propertyPath: "delta",
          message: "This value should be negative.",
          code: SYMFONY_VIOLATION_CODES.LESS_THAN_TOO_HIGH,
        })
      ).toBe(m.validation_must_be_negative())

      expect(
        translateSymfonyViolation({
          propertyPath: "delta",
          message: "This value should be either negative or zero.",
          code: SYMFONY_VIOLATION_CODES.LESS_THAN_OR_EQUAL_TOO_HIGH,
        })
      ).toBe(m.validation_must_be_non_positive())
    })

    it("falls back to standard Symfony English message patterns when code is missing", () => {
      setLocale("pl", { reload: false })

      expect(
        translateSymfonyViolation({
          propertyPath: "plainPassword",
          message: "This password has been leaked in a data breach.",
        })
      ).toBe(m.validation_compromised_password())

      expect(
        translateSymfonyViolation({
          propertyPath: "title",
          message: "This value should not be blank.",
        })
      ).toBe(m.validation_not_blank())

      expect(
        translateSymfonyViolation({
          propertyPath: "email",
          message: "This value is not a valid email address.",
        })
      ).toBe(m.validation_invalid_email())

      expect(
        translateSymfonyViolation({
          propertyPath: "name",
          message:
            "This value is too short. It should have 3 characters or more.",
        })
      ).toBe(m.validation_too_short())

      expect(
        translateSymfonyViolation({
          propertyPath: "name",
          message:
            "This value is too long. It should have 255 characters or less.",
        })
      ).toBe(m.validation_too_long())

      expect(
        translateSymfonyViolation({
          propertyPath: "slug",
          message: "This value is already used.",
        })
      ).toBe(m.validation_unique_value())
    })

    it("never leaks unknown violation codes or raw technical messages to the user", () => {
      setLocale("en", { reload: false })
      const unknownCode = "99999999-aaaa-bbbb-cccc-dddddddddddd"
      const rawMessage =
        "SQLSTATE[23505] duplicate key code=99999999-aaaa-bbbb-cccc-dddddddddddd on App\\Entity\\User"

      const fieldTranslated = translateSymfonyViolation({
        propertyPath: "secretField",
        message: rawMessage,
        code: unknownCode,
      })

      expect(fieldTranslated).toBe(m.validation_invalid_value())
      expect(fieldTranslated).not.toContain(unknownCode)
      expect(fieldTranslated).not.toContain("SQLSTATE")
      expect(fieldTranslated).not.toContain("App\\Entity\\User")

      const formTranslated = translateSymfonyViolation({
        propertyPath: "",
        message: rawMessage,
        code: unknownCode,
      })

      expect(formTranslated).toBe(m.validation_invalid_form())
      expect(formTranslated).not.toContain(unknownCode)
      expect(formTranslated).not.toContain("SQLSTATE")
    })
  })

  describe("mapApiPlatformViolation", () => {
    it("maps propertyPath via fieldMap and omits code from the returned object", () => {
      setLocale("en", { reload: false })

      const mapped = mapApiPlatformViolation(
        {
          propertyPath: "plainPassword",
          message: "This password has been leaked in a data breach.",
          code: SYMFONY_VIOLATION_CODES.NOT_COMPROMISED_PASSWORD,
        },
        { plainPassword: "password" }
      )

      expect(mapped).toEqual({
        field: "password",
        message: m.validation_compromised_password(),
      })
      expect("code" in mapped).toBe(false)
    })
  })

  describe("mapApiPlatformViolations", () => {
    it("groups multiple violations per field, deduplicates identical translated messages, and preserves distinct ones", () => {
      setLocale("en", { reload: false })

      const result = mapApiPlatformViolations(
        [
          {
            propertyPath: "plainPassword",
            message: "This value should not be blank.",
            code: SYMFONY_VIOLATION_CODES.NOT_BLANK,
          },
          {
            propertyPath: "plainPassword",
            message: "This value should not be blank.",
            code: SYMFONY_VIOLATION_CODES.NOT_BLANK,
          },
          {
            propertyPath: "plainPassword",
            message: "This password has been leaked in a data breach.",
            code: SYMFONY_VIOLATION_CODES.NOT_COMPROMISED_PASSWORD,
          },
        ],
        {
          fieldMap: { plainPassword: "password" },
        }
      )

      expect(result.fieldErrors.password).toEqual([
        m.validation_not_blank(),
        m.validation_compromised_password(),
      ])
      expect(result.formErrors).toEqual([])
      expect(result.violations).toHaveLength(2)
      expect(result.summary).toBe(m.validation_not_blank())
      expect(Object.isFrozen(result.fieldErrors)).toBe(true)
      expect(Object.isFrozen(result.fieldErrors.password)).toBe(true)
      expect(Object.isFrozen(result.formErrors)).toBe(true)
      expect(Object.isFrozen(result.violations)).toBe(true)
    })

    it("routes empty propertyPath and disallowed fields into formErrors", () => {
      setLocale("en", { reload: false })

      const result = mapApiPlatformViolations(
        [
          {
            propertyPath: "",
            message: "This value is already used.",
            code: SYMFONY_VIOLATION_CODES.UNIQUE_ENTITY_NOT_UNIQUE,
          },
          {
            propertyPath: "username",
            message: "This value should not be blank.",
            code: SYMFONY_VIOLATION_CODES.NOT_BLANK,
          },
          {
            propertyPath: "email",
            message: "This value is not a valid email address.",
            code: SYMFONY_VIOLATION_CODES.EMAIL_INVALID_FORMAT,
          },
        ],
        {
          allowedFields: ["email", "password"] as const,
        }
      )

      expect(result.fieldErrors).toEqual({
        email: [m.validation_invalid_email()],
      })
      expect(result.formErrors).toEqual([
        m.validation_unique_value(),
        m.validation_not_blank(),
      ])
      expect(result.summary).toBe(m.validation_unique_value())
    })

    it("falls back to validation_invalid_form summary when violations list is empty", () => {
      setLocale("en", { reload: false })

      const result = mapApiPlatformViolations([])
      expect(result.fieldErrors).toEqual({})
      expect(result.formErrors).toEqual([])
      expect(result.violations).toEqual([])
      expect(result.summary).toBe(m.validation_invalid_form())
    })
  })

  describe("mapApiPlatformValidationError", () => {
    it("returns null for non-422 ApiError, regular Error, null, undefined, and plain objects", () => {
      expect(mapApiPlatformValidationError(createApiError(400, {}))).toBeNull()
      expect(mapApiPlatformValidationError(createApiError(401, {}))).toBeNull()
      expect(mapApiPlatformValidationError(createApiError(403, {}))).toBeNull()
      expect(mapApiPlatformValidationError(createApiError(500, {}))).toBeNull()
      expect(mapApiPlatformValidationError(new Error("Boom"))).toBeNull()
      expect(mapApiPlatformValidationError(null)).toBeNull()
      expect(mapApiPlatformValidationError(undefined)).toBeNull()
      expect(mapApiPlatformValidationError({ status: 422 })).toBeNull()
    })

    it("maps 422 ApiError with violations into a translated MappedValidationResult", () => {
      setLocale("pl", { reload: false })

      const error = createApiError(422, {
        status: 422,
        violations: [
          {
            propertyPath: "email",
            message: "This value is not a valid email address.",
            code: SYMFONY_VIOLATION_CODES.EMAIL_INVALID_FORMAT,
          },
          {
            propertyPath: "plainPassword",
            message: "This password has been leaked in a data breach.",
            code: SYMFONY_VIOLATION_CODES.NOT_COMPROMISED_PASSWORD,
          },
        ],
      })

      const mapped = mapApiPlatformValidationError(error, {
        fieldMap: { plainPassword: "password" },
        allowedFields: ["email", "password"] as const,
      })

      expect(mapped).not.toBeNull()
      expect(mapped?.fieldErrors).toEqual({
        email: [m.validation_invalid_email()],
        password: [m.validation_compromised_password()],
      })
      expect(mapped?.formErrors).toEqual([])
      expect(mapped?.summary).toBe(m.validation_invalid_email())
    })

    it("maps 422 ApiError with empty violations to empty result with generic summary", () => {
      setLocale("en", { reload: false })

      const error = createApiError(422, {
        detail: "Validation failed",
      })

      const mapped = mapApiPlatformValidationError(error)
      expect(mapped).toEqual({
        fieldErrors: {},
        formErrors: [],
        violations: [],
        summary: m.validation_invalid_form(),
      })
    })
  })
})
