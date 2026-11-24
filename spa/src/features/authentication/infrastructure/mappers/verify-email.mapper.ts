import { isApiError } from "@/shared/api"
import { err, ok, type Result } from "@/shared/result"
import {
  createEmailVerificationError,
  type EmailVerificationError,
} from "../../domain/errors/auth-error"
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
  ): Result<void, EmailVerificationError> {
    if (dto?.isVerified === true) {
      return ok()
    }

    if (dto?.code === "USER_NOT_FOUND") {
      return err(createEmailVerificationError("user_not_found"))
    }

    return err(createEmailVerificationError("verification_failed"))
  }

  public static fromError(error: unknown): EmailVerificationError | null {
    if (!isApiError(error)) {
      return null
    }

    const code = extractErrorCode(error.data)
    if (code === "USER_NOT_FOUND") {
      return createEmailVerificationError("user_not_found")
    }

    if (error.status === 400 || error.status === 422) {
      return createEmailVerificationError("invalid_link")
    }

    if (error.status === 404) {
      return createEmailVerificationError("user_not_found")
    }

    if (error.status === 403 || error.status === 410) {
      return createEmailVerificationError("verification_failed")
    }

    return null
  }
}
