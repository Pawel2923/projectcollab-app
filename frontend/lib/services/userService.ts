import type { User } from "@/types/api/user";

import type { AppError } from "../../error/app-error";
import { Ok, type Result } from "../types/result";
import { apiGet } from "../utils/apiClient";
import { toErrorResult } from "../utils/errorHandler";

export async function getCurrentUser(): Promise<Result<User, AppError>> {
  try {
    const response = await apiGet<User>("/users/me");

    if (response.status !== 200) {
      return toErrorResult(response.error, "getUser");
    }

    if (!response.data) {
      return toErrorResult("No user data", "getUser");
    }

    return Ok(response.data);
  } catch (error) {
    // Re-throw Next.js redirects
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return toErrorResult(error, "getUser");
  }
}
