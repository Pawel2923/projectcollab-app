import { describe, it, expect } from "vitest"
import { ApiError } from "@/shared/api"
import { VerifyEmailMapper } from "./verify-email.mapper"

describe("VerifyEmailMapper", () => {
  describe("toDomain", () => {
    it("maps verified API Platform JSON-LD payload to verified result", () => {
      expect(
        VerifyEmailMapper.toDomain({
          "@context": "/contexts/VerifyEmailResponse",
          "@id": "/.well-known/genid/1",
          "@type": "VerifyEmailResponse",
          code: "EMAIL_VERIFIED",
          isVerified: true,
        })
      ).toEqual({ status: "verified" })
    })

    it("maps USER_NOT_FOUND payload to user_not_found failure", () => {
      expect(
        VerifyEmailMapper.toDomain({
          code: "USER_NOT_FOUND",
          isVerified: false,
        })
      ).toEqual({ status: "failed", reason: "user_not_found" })
    })

    it("maps unverified or missing-flag payload to verification_failed", () => {
      expect(
        VerifyEmailMapper.toDomain({
          code: "EMAIL_NOT_VERIFIED",
          isVerified: false,
        })
      ).toEqual({ status: "failed", reason: "verification_failed" })

      expect(VerifyEmailMapper.toDomain({})).toEqual({
        status: "failed",
        reason: "verification_failed",
      })

      expect(VerifyEmailMapper.toDomain(null)).toEqual({
        status: "failed",
        reason: "verification_failed",
      })
    })
  })

  describe("fromError", () => {
    it("maps 400 and 422 ApiError to invalid_link", () => {
      expect(
        VerifyEmailMapper.fromError(
          new ApiError(400, { detail: "Bad request" })
        )
      ).toEqual({ status: "failed", reason: "invalid_link" })

      expect(
        VerifyEmailMapper.fromError(
          new ApiError(422, {
            violations: [
              {
                propertyPath: "signature",
                message: "This value should not be null.",
              },
            ],
          })
        )
      ).toEqual({ status: "failed", reason: "invalid_link" })
    })

    it("maps 404 ApiError to user_not_found", () => {
      expect(
        VerifyEmailMapper.fromError(new ApiError(404, { detail: "Not found" }))
      ).toEqual({ status: "failed", reason: "user_not_found" })
    })

    it("maps 403 and 410 ApiError to verification_failed", () => {
      expect(
        VerifyEmailMapper.fromError(
          new ApiError(403, { detail: "Invalid signature" })
        )
      ).toEqual({ status: "failed", reason: "verification_failed" })

      expect(
        VerifyEmailMapper.fromError(
          new ApiError(410, { detail: "Link expired" })
        )
      ).toEqual({ status: "failed", reason: "verification_failed" })
    })

    it("maps 5xx ApiError and unexpected errors to server_error", () => {
      expect(
        VerifyEmailMapper.fromError(
          new ApiError(500, { detail: "Internal error" })
        )
      ).toEqual({ status: "failed", reason: "server_error" })

      expect(VerifyEmailMapper.fromError(new Error("Network down"))).toEqual({
        status: "failed",
        reason: "server_error",
      })
    })

    it("maps ApiError payload with explicit USER_NOT_FOUND code to user_not_found", () => {
      expect(
        VerifyEmailMapper.fromError(
          new ApiError(400, { code: "USER_NOT_FOUND", isVerified: false })
        )
      ).toEqual({ status: "failed", reason: "user_not_found" })
    })
  })
})
