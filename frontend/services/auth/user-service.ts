import { toErrorResult } from "@/services/error/app-error-to-result";
import type { User } from "@/types/api/user";
import { isRedirectError } from "@/utils/redirect-error";
import { Ok, type Result } from "@/utils/result";

import type { AppError } from "../error/app-error";
import { apiGet } from "../fetch/api-service";

export async function getCurrentUser(): Promise<Result<User, AppError>> {
  try {
    const response = await apiGet<User>("/users/me", true, false);

    if (response.status !== 200) {
      return toErrorResult(response.error, "getUser");
    }

    if (!response.data) {
      return toErrorResult("No user data", "getUser");
    }

    return Ok(response.data);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return toErrorResult(error, "getUser");
  }
}
