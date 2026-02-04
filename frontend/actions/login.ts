"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import type { User } from "@/actions/types/User";
import { handleApiError } from "@/lib/utils/errorHandler";

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
  password: z.string(),
  redirectUrl: z.string().optional(),
});

type LoginData =
  | FormData
  | {
      email: string;
      password: string;
      redirectUrl?: string;
    };

/**
 * Login a user using form data or email and password.
 * @param _initialState
 * @param formData
 */
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

    const nextApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!nextApiUrl) {
      return {
        ok: false,
        code: "SERVER_CONFIG_ERROR",
        status: 500,
      };
    }

    const res = await fetch(`${nextApiUrl}/auth/login`, {
      method: "POST",
      headers: {
        accepts: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validated.data),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Login failed:", res.status, data);
      return handleApiError({ ...data, status: res.status }, "Login");
    }

    const token: string | undefined = data?.token;
    if (!token) {
      return {
        ok: false,
        code: "UNAUTHORIZED",
        status: 401,
      };
    }

    (await cookies()).set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5, // 5 minutes
    });

    const refreshToken: string | undefined = data?.refresh_token;
    if (refreshToken) {
      (await cookies()).set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    if (
      validated.data.redirectUrl &&
      validated.data.redirectUrl.startsWith("/") &&
      !validated.data.redirectUrl.startsWith("//") &&
      !INVALID_REDIRECT_URLS.includes(validated.data.redirectUrl)
    ) {
      redirect(validated.data.redirectUrl);
    } else {
      redirect("/organizations");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return handleApiError(error, "Login");
  }
}
