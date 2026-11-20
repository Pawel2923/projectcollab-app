import { describe, it, expect } from "vitest"
import { ApiError, isApiError } from "./api-error"

describe("ApiError", () => {
  it("extracts hydra:description when present", () => {
    const error = new ApiError(400, {
      "@context": "/contexts/Error",
      "hydra:title": "An error occurred",
      "hydra:description": "Invalid credentials provided",
    })

    expect(error.message).toBe("Invalid credentials provided")
    expect(error.status).toBe(400)
    expect(error.name).toBe("ApiError")
  })

  it("extracts detail when hydra:description is missing", () => {
    const error = new ApiError(404, {
      detail: "Resource not found",
    })

    expect(error.message).toBe("Resource not found")
    expect(error.status).toBe(404)
  })

  it("extracts message when hydra:description and detail are missing", () => {
    const error = new ApiError(500, {
      message: "Internal server error",
    })

    expect(error.message).toBe("Internal server error")
  })

  it("extracts hydra:title as fallback title", () => {
    const error = new ApiError(403, {
      "hydra:title": "Access Denied",
    })

    expect(error.message).toBe("Access Denied")
  })

  it("falls back to generic status code message when data is empty or non-record", () => {
    const error = new ApiError(502, null)
    expect(error.message).toBe("Request failed with status 502")
  })

  it("parses validation violations correctly and freezes the list", () => {
    const error = new ApiError(422, {
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

  it("handles empty violations safely", () => {
    const error = new ApiError(400, {})
    expect(error.violations).toEqual([])
  })

  it("identifies ApiError instances with isApiError", () => {
    const apiError = new ApiError(400, {})
    const regularError = new Error("Regular error")

    expect(isApiError(apiError)).toBe(true)
    expect(isApiError(regularError)).toBe(false)
    expect(isApiError(null)).toBe(false)
    expect(isApiError(undefined)).toBe(false)
    expect(isApiError({ status: 400 })).toBe(false)
  })
})
