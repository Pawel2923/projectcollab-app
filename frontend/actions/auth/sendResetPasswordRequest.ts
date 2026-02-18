"use server";

import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { handleApiError } from "@/services/error/api-error-handler";

const schema = z.object({
  email: z.email(),
});

type ActionResultData = ActionResult & {
  isRequestProcessed: boolean;
};

export default async function sendResetPasswordRequest(
  _initialState: unknown,
  formData: FormData,
): Promise<ActionResultData> {
  try {
    const validated = schema.safeParse({
      email: formData.get("email"),
    });

    if (!validated.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        status: 400,
        errors: z.treeifyError(validated.error),
        isRequestProcessed: false,
      };
    }

    const nextApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!nextApiUrl) {
      return {
        ok: false,
        code: "SERVER_CONFIG_ERROR",
        status: 500,
        isRequestProcessed: false,
      };
    }

    const res = await fetch(`${nextApiUrl}/reset-password/send`, {
      method: "POST",
      headers: {
        accept: "application/ld+json",
        "Content-Type": "application/ld+json",
      },
      body: JSON.stringify({ email: validated.data.email }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Reset password request failed:", res.status, data);
      const handledError = handleApiError(data, "Send reset password request");
      return {
        ...handledError,
        isRequestProcessed: true,
      };
    }

    return { ok: true, isRequestProcessed: true };
  } catch (error) {
    const handledError = handleApiError(error, "Send reset password request");
    return {
      ...handledError,
      isRequestProcessed: false,
    };
  }
}
