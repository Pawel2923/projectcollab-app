"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { signIn } from "@/auth";
import { handleApiError } from "@/services/error/api-error-handler";
import type { User } from "@/types/api/user";

const INVALID_REDIRECT_URLS = [
  "/",
  "/email-verified",
  "/logout",
  "/signin",
  "/signup",
  "/verify-email",
  "/reset-password",
  "/reset-password/form",
  "/reset-password/sent",
  "/verify-email/verify",
];

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
  redirectUrl: z.string().optional(),
});

type LoginData =
  | FormData
  | {
      email: string;
      password: string;
      redirectUrl?: string;
    };

export default async function login(
  _initialState: unknown,
  formData: LoginData,
): Promise<ActionResult<User>> {
  try {
    const validated = schema.safeParse(
      formData instanceof FormData
        ? {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectUrl: formData.get("redirectUrl"),
          }
        : formData,
    );

    if (!validated.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        status: 400,
        errors: z.treeifyError(validated.error),
      };
    }

    const redirectUrl = validated.data.redirectUrl;
    const targetUrl =
      redirectUrl &&
      redirectUrl.startsWith("/") &&
      !redirectUrl.startsWith("//") &&
      !INVALID_REDIRECT_URLS.includes(redirectUrl)
        ? redirectUrl
        : "/organizations";

    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirectTo: targetUrl,
    });

    return {
      ok: true,
      content: {} as User,
    };
  } catch (error) {
    if (
      (error instanceof Error && error.message === "NEXT_REDIRECT") ||
      (typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        String((error as { digest: string }).digest).startsWith(
          "NEXT_REDIRECT",
        ))
    ) {
      throw error;
    }

    if (error instanceof AuthError) {
      return {
        ok: false,
        code: "UNAUTHORIZED",
        status: 401,
        message: "Nieprawidłowy e-mail lub hasło.",
      };
    }

    return handleApiError(error, "Login");
  }
}
