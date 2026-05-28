import { NextResponse } from "next/server";

import { signOut } from "@/auth";
import {
  clearAuthCookies,
  revokeRefreshToken,
} from "@/services/auth/token-service";
import { logError } from "@/services/error/error-logger";
import { logToServer } from "@/services/log/server-logger";
import type { SignOutRedirectResponse } from "@/types/auth/logout";
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
      return new NextResponse(JSON.stringify({ ok: false }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const redirect: SignOutRedirectResponse = await signOut({
      redirect: false,
      redirectTo: "/signin",
    });

    return NextResponse.json({ ok: true, redirect });
  } catch (error) {
    await logToServer({
      level: "error",
      message: "Logout failed",
      context: { error },
      serviceName: "api.auth.logout",
    });

    return NextResponse.json({ ok: false });
  }
}
