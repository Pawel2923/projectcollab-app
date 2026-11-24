import { describe, it, expect } from "vitest"
import { createApiError, isApiError } from "./api-error"

describe("ApiError", () => {
  it("extracts hydra:description when present", () => {
    const error = createApiError(400, {
      "@context": "/contexts/Error",
      "hydra:title": "An error occurred",
      "hydra:description": "Invalid credentials provided",
    })

    expect(error.message).toBe("Invalid credentials provided")
    expect(error.status).toBe(400)
    expect(error.name).toBe("ApiError")
    expect(Object.isFrozen(error)).toBe(true)
  })

  it("extracts detail when hydra:description is missing", () => {
    const error = createApiError(404, {
      detail: "Resource not found",
    })

    expect(error.message).toBe("Resource not found")
    expect(error.status).toBe(404)
  })

  it("extracts description when hydra:description and detail are missing", () => {
    const error = createApiError(422, {
      description: "Validation failed",
    })

    expect(error.message).toBe("Validation failed")
    expect(error.status).toBe(422)
  })

  it("extracts message when hydra:description and detail are missing", () => {
    const error = createApiError(500, {
      message: "Internal server error",
    })

    expect(error.message).toBe("Internal server error")
  })

  it("extracts hydra:title as fallback title", () => {
    const error = createApiError(403, {
      "hydra:title": "Access Denied",
    })

    expect(error.message).toBe("Access Denied")
  })

  it("falls back to generic status code message when data is empty or non-record", () => {
    const error = createApiError(502, null)
    expect(error.message).toBe("Request failed with status 502")
  })

  it("parses validation violations correctly and freezes the list", () => {
    const error = createApiError(422, {
      violations: [
        {
          propertyPath: "email",
          message: "This value is not a valid email address.",
        },
        { propertyPath: "password", message: "This value is too short." },
      ],
    })

    expect(error.violations).toHaveLength(2)
    expect(error.violations[0]).toEqual({
      propertyPath: "email",
      message: "This value is not a valid email address.",
    })
    expect(Object.isFrozen(error.violations)).toBe(true)
  })

  it("preserves violation codes when present, freezes violation items, and normalizes missing propertyPath", () => {
    const error = createApiError(422, {
      violations: [
        {
          propertyPath: "email",
          message: "This value is not a valid email address.",
          code: " bd79c0ab-ddba-46cc-a703-a7a4b08de310 ",
        },
        {
          propertyPath: "plainPassword",
          message: "This value should not be blank.",
          code: "   ",
        },
        {
          message: "Class-level constraint violation.",
          code: "23bd9dbf-6b9b-41cd-a99e-4844bcf3077f",
        },
      ],
    })

    expect(error.violations).toHaveLength(3)
    expect(error.violations[0]).toEqual({
      propertyPath: "email",
      message: "This value is not a valid email address.",
      code: "bd79c0ab-ddba-46cc-a703-a7a4b08de310",
    })
    expect(error.violations[1]).toEqual({
      propertyPath: "plainPassword",
      message: "This value should not be blank.",
    })
    expect("code" in error.violations[1]).toBe(false)
    expect(error.violations[2]).toEqual({
      propertyPath: "",
      message: "Class-level constraint violation.",
      code: "23bd9dbf-6b9b-41cd-a99e-4844bcf3077f",
    })
    expect(Object.isFrozen(error.violations[0])).toBe(true)
    expect(Object.isFrozen(error.violations[1])).toBe(true)
    expect(Object.isFrozen(error.violations[2])).toBe(true)
  })

  it("handles empty violations safely", () => {
    const error = createApiError(400, {})
    expect(error.violations).toEqual([])
  })

  it("identifies ApiError objects with isApiError", () => {
    const apiError = createApiError(400, {})
    const regularError = new Error("Regular error")

    expect(isApiError(apiError)).toBe(true)
    expect(isApiError(regularError)).toBe(false)
    expect(isApiError(null)).toBe(false)
    expect(isApiError(undefined)).toBe(false)
    expect(isApiError({ status: 400 })).toBe(false)
  })
})
