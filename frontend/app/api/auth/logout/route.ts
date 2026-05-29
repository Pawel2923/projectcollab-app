import { NextResponse } from "next/server";

import { signOut } from "@/auth";
import {
  clearAuthCookies,
  revokeRefreshToken,
} from "@/services/auth/token-service";
import { logError } from "@/services/error/error-logger";
import { logToServer } from "@/services/log/server-logger";
import type { LogoutResponse } from "@/types/auth/logout";
import { isOk } from "@/utils/result";

export async function POST() {
  try {
    const revokeRefreshTokenResult = await revokeRefreshToken();
    if (!isOk(revokeRefreshTokenResult)) {
      logError(revokeRefreshTokenResult.error);
    }

    const clearAuthCookiesResult = await clearAuthCookies();
    if (!isOk(clearAuthCookiesResult)) {
      logError(clearAuthCookiesResult.error);
      return new NextResponse(null, {
        status: 500,
      });
    }

    const redirect: LogoutResponse = await signOut({
      redirect: false,
      redirectTo: "/signin",
    });

    return NextResponse.json(redirect);
  } catch (error) {
    await logToServer({
      level: "error",
      message: "Logout failed",
      context: { error },
      serviceName: "api.auth.logout",
    });

    return new NextResponse(null, {
      status: 500,
    });
  }
}
