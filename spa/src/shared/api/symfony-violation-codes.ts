import { m } from "@/paraglide/messages"

/**
 * Canonical Symfony Validator and Doctrine Bridge constraint violation UUID codes.
 */
export const SYMFONY_VIOLATION_CODES = {
  NOT_BLANK: "c1051bb4-d103-4f74-8988-acbcafc7fdc3",
  NOT_NULL: "ad32d13f-c3d4-423b-909a-857b961eb720",
  EMAIL_INVALID_FORMAT: "bd79c0ab-ddba-46cc-a703-a7a4b08de310",
  LENGTH_TOO_SHORT: "9ff3fdc4-b214-49db-8718-39c315e33d45",
  LENGTH_TOO_LONG: "d94b19cc-114f-4f44-9cc4-4138e80a87b9",
  LENGTH_NOT_EQUAL: "4b6f5c76-22b4-409d-af16-fbe823ba9332",
  LENGTH_INVALID_CHARACTERS: "35e6a710-aa2e-4719-b58e-24b35749b767",
  UNIQUE_ENTITY_NOT_UNIQUE: "23bd9dbf-6b9b-41cd-a99e-4844bcf3077f",
  NOT_COMPROMISED_PASSWORD: "d9bcdbfe-a9d6-4bfa-a8ff-da5fd93e0f6d",
  PASSWORD_STRENGTH: "4234df00-45dd-49a4-b303-a75dbf8b10d8",
  RANGE_TOO_LOW: "76454e69-502c-46c5-9643-f447d837c4d5",
  RANGE_TOO_HIGH: "2d28afcb-e32e-45fb-a815-01c431a86a69",
  RANGE_NOT_IN_RANGE: "04b91c99-a946-4221-afc5-e65ebac401eb",
  RANGE_INVALID_CHARACTERS: "ad9a9798-7a99-4df7-8ce9-46e416a1e60b",
  CHOICE_NO_SUCH_CHOICE: "8e179f1b-97aa-4560-a02f-2a8b42e49df7",
  CHOICE_TOO_FEW: "11edd7eb-5872-4b6e-9f12-89923999fd0e",
  CHOICE_TOO_MANY: "9bd98e49-211c-433f-8630-fd1c2d0f08c3",
  TYPE_INVALID_TYPE: "ba785a8c-82cb-4283-967c-3cf342181b40",
  REGEX_FAILED: "de1e3db3-5ed4-4941-aae4-59f3667cc3a3",
  DATETIME_INVALID_FORMAT: "1a9da513-2640-4f84-9b6a-4d99dcddc628",
  DATETIME_INVALID_DATE: "d52afa47-620d-4d99-9f08-f4d85b36e33c",
  DATETIME_INVALID_TIME: "5e797c9d-74f7-4098-baa3-94390c447b27",
  DATE_INVALID_FORMAT: "69819696-02ac-4a99-9ff0-14e127c4d1bc",
  DATE_INVALID_DATE: "3c184ce5-b31d-4de7-8b76-326da7b2be93",
  GREATER_THAN_TOO_LOW: "778b7ae0-84d3-481a-9dec-35fdb64b1d78",
  GREATER_THAN_OR_EQUAL_TOO_LOW: "ea4e51d1-3342-48bd-87f1-9e672cd90cad",
  LESS_THAN_TOO_HIGH: "079d7420-2d13-460c-8756-de810eeb37d2",
  LESS_THAN_OR_EQUAL_TOO_HIGH: "30fbb013-d015-4232-8b3b-8f3be97a7e14",
  EQUAL_TO_NOT_EQUAL: "478618a7-95ba-473d-9101-cabd45e49115",
  NOT_EQUAL_TO_IS_EQUAL: "aa2e33da-25c8-4d76-8c6c-812f02ea89dd",
  URL_INVALID: "57c2f299-1154-4870-89bb-ef3b1f5ad229",
  URL_MISSING_TLD: "8a5d387f-0716-46b4-844b-67367faf435a",
  FILE_NOT_FOUND: "d2a3fb6e-7ddc-4210-8fbf-2ab345ce1998",
  FILE_NOT_READABLE: "c20c92a4-5bfa-4202-9477-28e800e0f6ff",
  FILE_EMPTY: "5d743385-9775-4aa5-8ff5-495fb1e60137",
  FILE_TOO_LARGE: "df8637af-d466-48c6-a59d-e7126250a654",
  FILE_INVALID_MIME_TYPE: "744f00bc-4389-4c74-92de-9a43cde55534",
  FILE_INVALID_EXTENSION: "c8c7315c-6186-4719-8b71-5659e16bdcb7",
  FILE_FILENAME_TOO_LONG: "e5706483-91a8-49d8-9a59-5e81a3c634a8",
  FILE_FILENAME_INVALID_CHARACTERS: "04ee58e1-42b4-45c7-8423-8a4a145fedd9",
} as const

export type SymfonyViolationCode =
  (typeof SYMFONY_VIOLATION_CODES)[keyof typeof SYMFONY_VIOLATION_CODES]

/**
 * Lazy Paraglide message resolvers keyed by Symfony constraint UUID.
 * Functions are evaluated on demand so runtime locale changes take effect immediately.
 */
export const SYMFONY_VIOLATION_MESSAGE_MAP: Readonly<
  Record<string, () => string>
> = Object.freeze({
  [SYMFONY_VIOLATION_CODES.NOT_BLANK]: () => m.validation_not_blank(),
  [SYMFONY_VIOLATION_CODES.NOT_NULL]: () => m.validation_not_null(),
  [SYMFONY_VIOLATION_CODES.EMAIL_INVALID_FORMAT]: () =>
    m.validation_invalid_email(),
  [SYMFONY_VIOLATION_CODES.LENGTH_TOO_SHORT]: () => m.validation_too_short(),
  [SYMFONY_VIOLATION_CODES.LENGTH_TOO_LONG]: () => m.validation_too_long(),
  [SYMFONY_VIOLATION_CODES.LENGTH_NOT_EQUAL]: () =>
    m.validation_invalid_length(),
  [SYMFONY_VIOLATION_CODES.LENGTH_INVALID_CHARACTERS]: () =>
    m.validation_invalid_characters(),
  [SYMFONY_VIOLATION_CODES.UNIQUE_ENTITY_NOT_UNIQUE]: () =>
    m.validation_unique_value(),
  [SYMFONY_VIOLATION_CODES.NOT_COMPROMISED_PASSWORD]: () =>
    m.validation_compromised_password(),
  [SYMFONY_VIOLATION_CODES.PASSWORD_STRENGTH]: () =>
    m.validation_password_too_weak(),
  [SYMFONY_VIOLATION_CODES.RANGE_TOO_LOW]: () => m.validation_value_too_small(),
  [SYMFONY_VIOLATION_CODES.RANGE_TOO_HIGH]: () =>
    m.validation_value_too_large(),
  [SYMFONY_VIOLATION_CODES.RANGE_NOT_IN_RANGE]: () =>
    m.validation_out_of_range(),
  [SYMFONY_VIOLATION_CODES.RANGE_INVALID_CHARACTERS]: () =>
    m.validation_invalid_number(),
  [SYMFONY_VIOLATION_CODES.CHOICE_NO_SUCH_CHOICE]: () =>
    m.validation_invalid_choice(),
  [SYMFONY_VIOLATION_CODES.CHOICE_TOO_FEW]: () =>
    m.validation_too_few_choices(),
  [SYMFONY_VIOLATION_CODES.CHOICE_TOO_MANY]: () =>
    m.validation_too_many_choices(),
  [SYMFONY_VIOLATION_CODES.TYPE_INVALID_TYPE]: () =>
    m.validation_invalid_type(),
  [SYMFONY_VIOLATION_CODES.REGEX_FAILED]: () => m.validation_invalid_format(),
  [SYMFONY_VIOLATION_CODES.DATETIME_INVALID_FORMAT]: () =>
    m.validation_invalid_datetime(),
  [SYMFONY_VIOLATION_CODES.DATETIME_INVALID_DATE]: () =>
    m.validation_invalid_date(),
  [SYMFONY_VIOLATION_CODES.DATETIME_INVALID_TIME]: () =>
    m.validation_invalid_time(),
  [SYMFONY_VIOLATION_CODES.DATE_INVALID_FORMAT]: () =>
    m.validation_invalid_date(),
  [SYMFONY_VIOLATION_CODES.DATE_INVALID_DATE]: () =>
    m.validation_invalid_date(),
  [SYMFONY_VIOLATION_CODES.GREATER_THAN_TOO_LOW]: () =>
    m.validation_value_too_small(),
  [SYMFONY_VIOLATION_CODES.GREATER_THAN_OR_EQUAL_TOO_LOW]: () =>
    m.validation_value_too_small(),
  [SYMFONY_VIOLATION_CODES.LESS_THAN_TOO_HIGH]: () =>
    m.validation_value_too_large(),
  [SYMFONY_VIOLATION_CODES.LESS_THAN_OR_EQUAL_TOO_HIGH]: () =>
    m.validation_value_too_large(),
  [SYMFONY_VIOLATION_CODES.EQUAL_TO_NOT_EQUAL]: () => m.validation_not_equal(),
  [SYMFONY_VIOLATION_CODES.NOT_EQUAL_TO_IS_EQUAL]: () =>
    m.validation_value_not_allowed(),
  [SYMFONY_VIOLATION_CODES.URL_INVALID]: () => m.validation_invalid_url(),
  [SYMFONY_VIOLATION_CODES.URL_MISSING_TLD]: () => m.validation_invalid_url(),
  [SYMFONY_VIOLATION_CODES.FILE_NOT_FOUND]: () =>
    m.validation_file_unreadable(),
  [SYMFONY_VIOLATION_CODES.FILE_NOT_READABLE]: () =>
    m.validation_file_unreadable(),
  [SYMFONY_VIOLATION_CODES.FILE_EMPTY]: () => m.validation_file_empty(),
  [SYMFONY_VIOLATION_CODES.FILE_TOO_LARGE]: () => m.validation_file_too_large(),
  [SYMFONY_VIOLATION_CODES.FILE_INVALID_MIME_TYPE]: () =>
    m.validation_file_invalid_type(),
  [SYMFONY_VIOLATION_CODES.FILE_INVALID_EXTENSION]: () =>
    m.validation_file_invalid_type(),
  [SYMFONY_VIOLATION_CODES.FILE_FILENAME_TOO_LONG]: () =>
    m.validation_filename_too_long(),
  [SYMFONY_VIOLATION_CODES.FILE_FILENAME_INVALID_CHARACTERS]: () =>
    m.validation_filename_invalid(),
})
