import { NextResponse } from "next/server";

import { auth, unstable_update } from "@/auth";
import { AppError } from "@/services/error/app-error";
import { logToServer } from "@/services/log/server-logger";

export async function POST() {
  try {
    const session = await auth();

    if (!session || !session.refreshToken) {
      const error = new AppError({
        message: "No refresh token available. Please log in.",
        code: "UNAUTHORIZED",
        status: 401,
        context: "Token Refresh",
      });
      return NextResponse.json(error.toJSON(), { status: 401 });
    }

    const updatedSession = await unstable_update({});

    if (
      !updatedSession ||
      !updatedSession.accessToken ||
      updatedSession.error
    ) {
      const error = new AppError({
        message: "Session token refresh failed.",
        code: "UNAUTHORIZED",
        status: 401,
        context: "Token Refresh",
      });
      return NextResponse.json(error.toJSON(), { status: 401 });
    }

    return NextResponse.json({ token: updatedSession.accessToken });
  } catch (error) {
    await logToServer({
      level: "error",
      message: "Token refresh error",
      serviceName: "api.auth.refresh-token",
      context: { error: String(error) },
      errorStack: (error as Error)?.stack,
    });

    const appError = new AppError({
      message: "Failed to refresh token",
      code: "SERVER_ERROR",
      status: 500,
      context: "Token Refresh",
      originalError: error,
    });

    return NextResponse.json(appError.toJSON(), { status: 500 });
  }
}
