import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { handleApiError } from "@/services/error/api-error-handler";
import { AppError } from "@/services/error/app-error";
import { logToServer } from "@/services/log/server-logger";
import { getApiUrl } from "@/utils/get-api-url";

export async function GET(req: NextRequest) {
  try {
    const resetToken = req.nextUrl.searchParams.get("reset_token") ?? "";
    if (resetToken === "") {
      const error = new AppError({
        message: "Reset token is required",
        code: "VALIDATION_ERROR",
        status: 400,
        context: "Check Reset Token",
      });
      return NextResponse.json(error.toJSON(), { status: 400 });
    }

    const nextApiUrl = getApiUrl();
    if (!nextApiUrl) {
      await logToServer({
        level: "error",
        message: "NextApi URL is missing",
        serviceName: "route.api.auth.check-reset",
      });
      const error = new AppError({
        message: "API URL not configured",
        code: "SERVER_CONFIG_ERROR",
        status: 500,
        context: "Check Reset Token",
      });
      return NextResponse.json(error.toJSON(), { status: 500 });
    }

    const res = await fetch(
      `${nextApiUrl}/reset-password/validate?reset_token=${encodeURIComponent(resetToken)}`,
      {
        method: "GET",
        headers: {
          accept: "application/ld+json",
        },
        cache: "no-cache",
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      await logToServer({
        level: "error",
        message: "Reset password token validation failed",
        serviceName: "route.api.auth.check-reset",
        context: { status: res.status, body: data },
      });

      const errorResult = handleApiError(data, "Check Reset Token");
      return NextResponse.json(
        {
          code: errorResult.code,
          message: errorResult.message,
          violations: errorResult.violations,
        },
        { status: errorResult.status },
      );
    }

    if (data.isValid === true) {
      return new Response(null, { status: 204 });
    } else {
      const error = new AppError({
        message: "Invalid or expired reset token",
        code: "VALIDATION_ERROR",
        status: 400,
        context: "Check Reset Token",
      });
      return NextResponse.json(error.toJSON(), { status: 400 });
    }
  } catch (error) {
    await logToServer({
      level: "error",
      message: "Check reset token error",
      serviceName: "route.api.auth.check-reset",
      context: { error: String(error) },
      errorStack: (error as Error)?.stack,
    });
    const errorResult = handleApiError(error, "Check Reset Token");
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
