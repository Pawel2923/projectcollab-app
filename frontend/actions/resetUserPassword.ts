"use server";

import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { handleApiError } from "@/lib/utils/errorHandler";

const schema = z
  .object({
    password: z.string(),
    repeatPassword: z.string(),
    token: z.string().min(1),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match",
  });

export default async function resetUserPassword(
  _initialState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const validated = schema.safeParse({
      password: formData.get("password"),
      repeatPassword: formData.get("repeatPassword"),
      token: formData.get("token"),
    });

    if (!validated.success) {
      console.error("Validation error", validated.error);
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        status: 400,
        errors: z.treeifyError(validated.error),
      };
    }

    const nextApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!nextApiUrl) {
      console.error("Server config error: NEXT_PUBLIC_API_URL is not set");
      return {
        ok: false,
        code: "SERVER_CONFIG_ERROR",
        status: 500,
      };
    }

    const res = await fetch(`${nextApiUrl}/reset-password/reset`, {
      method: "POST",
      headers: {
        accept: "application/ld+json",
        "Content-Type": "application/ld+json",
      },
      body: JSON.stringify({
        plainPassword: validated.data.password,
        token: validated.data.token,
      }),
    });

    // Parse response for both success and error cases
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Reset password failed:", res.status, data);
      return handleApiError(data, "Reset password");
    }

    return { ok: true };
  } catch (error) {
    return handleApiError(error, "Reset password");
  }
}
