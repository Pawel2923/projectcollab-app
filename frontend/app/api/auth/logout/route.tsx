import { NextResponse } from "next/server";

import { signOut } from "@/auth";
import {
  clearAuthCookies,
  revokeRefreshToken,
} from "@/services/auth/token-service";
import { logToServer } from "@/services/log/server-logger";
import type { SignOutRedirectResponse } from "@/types/auth/logout";

export async function POST() {
  try {
    await revokeRefreshToken();
    await clearAuthCookies();
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
