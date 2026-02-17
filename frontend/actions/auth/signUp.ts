"use server";

import { z } from "zod";

import login from "@/actions/auth/login";
import type { ActionResult } from "@/actions/types/ActionResult";
import { handleApiError } from "@/services/error/api-error-handler";
import type { User } from "@/types/api/user";

const schema = z.object({
  email: z.email(),
  password: z.string(),
});

/**
 * Create a new user account using form data.
 * @param _initialState
 * @param formData
 */
export default async function signUp(
  _initialState: unknown,
  formData: FormData,
): Promise<ActionResult<User>> {
  try {
    const validatedFields = schema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        status: 400,
        errors: z.treeifyError(validatedFields.error),
      };
    }

    const { email, password } = validatedFields.data;

    const nextApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!nextApiUrl) {
      return {
        ok: false,
        code: "SERVER_CONFIG_ERROR",
        status: 500,
      };
    }

    const res = await fetch(`${nextApiUrl}/users`, {
      method: "POST",
      headers: {
        accept: "application/ld+json",
        "Content-Type": "application/ld+json",
      },
      body: JSON.stringify({ email, plainPassword: password }),
    });

    // Parse response for both success and error cases
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Create user failed:", res.status, data);
      return handleApiError({ ...data, status: res.status }, "Create user");
    }

    // Automatically log in the user after successful registration
    return await login(null, {
      email,
      password,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return handleApiError(error, "Create user");
  }
}
