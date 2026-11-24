import { ApiError } from "@/shared/api"
import type { EmailVerificationResult } from "../../domain/models/email-verification"
import type { ApiVerifyEmailResponseDto } from "../dto/verify-email-api.dto"

function extractErrorCode(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null
  }
  const code = (data as { code?: unknown }).code
  return typeof code === "string" ? code : null
}

export class VerifyEmailMapper {
  public static toDomain(
    dto: ApiVerifyEmailResponseDto | null | undefined
  ): EmailVerificationResult {
    if (dto?.isVerified === true) {
      return { status: "verified" }
    }

    if (dto?.code === "USER_NOT_FOUND") {
      return { status: "failed", reason: "user_not_found" }
    }

    return { status: "failed", reason: "verification_failed" }
  }

  public static fromError(error: unknown): EmailVerificationResult {
    if (error instanceof ApiError) {
      const code = extractErrorCode(error.data)
      if (code === "USER_NOT_FOUND") {
        return { status: "failed", reason: "user_not_found" }
      }

      if (error.status === 400 || error.status === 422) {
        return { status: "failed", reason: "invalid_link" }
      }

      if (error.status === 404) {
        return { status: "failed", reason: "user_not_found" }
      }

      if (error.status === 403 || error.status === 410) {
        return { status: "failed", reason: "verification_failed" }
      }

      return { status: "failed", reason: "server_error" }
    }

    return { status: "failed", reason: "server_error" }
  }
}
