import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { AppError } from "@/lib/types/errors";
import { handleApiError } from "@/lib/utils/errorHandler";

export async function POST() {
  try {
    let refreshToken = (await cookies()).get("refresh_token")?.value;

    if (!refreshToken) {
      const session = await auth();
      refreshToken = session?.refreshToken;
    }

    if (!refreshToken) {
      const error = new AppError({
        message: "No refresh token available. Please log in.",
        code: "UNAUTHORIZED",
        status: 401,
        context: "Token Refresh",
      });
      return NextResponse.json(error.toJSON(), { status: 401 });
    }

    const nextApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!nextApiUrl) {
      const error = new AppError({
        message: "API URL not configured",
        code: "SERVER_CONFIG_ERROR",
        status: 500,
        context: "Token Refresh",
      });
      return NextResponse.json(error.toJSON(), { status: 500 });
    }

    const res = await fetch(`${nextApiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        accepts: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorResult = handleApiError(data, "Token Refresh");
      return NextResponse.json(
        {
          code: errorResult.code,
          message: errorResult.message,
          violations: errorResult.violations,
        },
        { status: errorResult.status },
      );
    }

    const newToken = data?.token;

    if (!newToken) {
      const error = new AppError({
        message: "No token received from server",
        code: "SERVER_ERROR",
        status: 500,
        context: "Token Refresh",
      });
      return NextResponse.json(error.toJSON(), { status: 500 });
    }

    const cookieStore = await cookies();
    cookieStore.set("access_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5, // 5 minutes
    });

    return NextResponse.json({ token: newToken });
  } catch (error) {
    console.error("Token refresh error:", error);
    const errorResult = handleApiError(error, "Token Refresh");
    return NextResponse.json(
      {
        code: errorResult.code,
        message: errorResult.message,
        violations: errorResult.violations,
      },
      { status: errorResult.status },
    );
  }
}
