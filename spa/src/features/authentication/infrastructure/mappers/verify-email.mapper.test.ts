import { describe, it, expect } from "vitest"
import { createApiError } from "@/shared/api"
import { err, ok } from "@/shared/result"
import { createEmailVerificationError } from "../../domain/errors/auth-error"
import { VerifyEmailMapper } from "./verify-email.mapper"

describe("VerifyEmailMapper", () => {
  describe("toDomain", () => {
    it("maps verified API Platform JSON-LD payload to ok result", () => {
      expect(
        VerifyEmailMapper.toDomain({
          "@context": "/contexts/VerifyEmailResponse",
          "@id": "/.well-known/genid/1",
          "@type": "VerifyEmailResponse",
          code: "EMAIL_VERIFIED",
          isVerified: true,
        })
      ).toEqual(ok())
    })

    it("maps USER_NOT_FOUND payload to user_not_found domain error result", () => {
      expect(
        VerifyEmailMapper.toDomain({
          code: "USER_NOT_FOUND",
          isVerified: false,
        })
      ).toEqual(err(createEmailVerificationError("user_not_found")))
    })

    it("maps unverified or missing-flag payload to verification_failed domain error result", () => {
      expect(
        VerifyEmailMapper.toDomain({
          code: "EMAIL_NOT_VERIFIED",
          isVerified: false,
        })
      ).toEqual(err(createEmailVerificationError("verification_failed")))

      expect(VerifyEmailMapper.toDomain({})).toEqual(
        err(createEmailVerificationError("verification_failed"))
      )

      expect(VerifyEmailMapper.toDomain(null)).toEqual(
        err(createEmailVerificationError("verification_failed"))
      )
    })
  })

  describe("fromError", () => {
    it("maps 400 and 422 ApiError to invalid_link domain error", () => {
      expect(
        VerifyEmailMapper.fromError(
          createApiError(400, { detail: "Bad request" })
        )
      ).toEqual(createEmailVerificationError("invalid_link"))

      expect(
        VerifyEmailMapper.fromError(
          createApiError(422, {
            violations: [
              {
                propertyPath: "signature",
                message: "This value should not be null.",
              },
            ],
          })
        )
      ).toEqual(createEmailVerificationError("invalid_link"))
    })

    it("maps 404 ApiError to user_not_found domain error", () => {
      expect(
        VerifyEmailMapper.fromError(
          createApiError(404, { detail: "Not found" })
        )
      ).toEqual(createEmailVerificationError("user_not_found"))
    })

    it("maps 403 and 410 ApiError to verification_failed domain error", () => {
      expect(
        VerifyEmailMapper.fromError(
          createApiError(403, { detail: "Invalid signature" })
        )
      ).toEqual(createEmailVerificationError("verification_failed"))

      expect(
        VerifyEmailMapper.fromError(
          createApiError(410, { detail: "Link expired" })
        )
      ).toEqual(createEmailVerificationError("verification_failed"))
    })

    it("returns null for 5xx ApiError and unexpected errors so they propagate as unexpected failures", () => {
      expect(
        VerifyEmailMapper.fromError(
          createApiError(500, { detail: "Internal error" })
        )
      ).toBeNull()

      expect(VerifyEmailMapper.fromError(new Error("Network down"))).toBeNull()
    })

    it("maps ApiError payload with explicit USER_NOT_FOUND code to user_not_found domain error", () => {
      expect(
        VerifyEmailMapper.fromError(
          createApiError(400, { code: "USER_NOT_FOUND", isVerified: false })
        )
      ).toEqual(createEmailVerificationError("user_not_found"))
    })
  })
})
