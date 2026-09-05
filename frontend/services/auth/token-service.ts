import "server-only";

import { cookies } from "next/headers";

import { auth, unstable_update } from "@/auth";
import { getApiUrl } from "@/utils/get-api-url";
import type { Result } from "@/utils/result";
import { Err, Ok } from "@/utils/result";

import { AppError } from "../error/app-error";

export async function getOrRefreshAccessToken(
  _nextApiUrl?: string,
  _refreshOnUndefined: boolean = true,
): Promise<string | undefined> {
  try {
    const session = await auth();
    if (!session || session.error || !session.accessToken) {
      return undefined;
    }

    return session.accessToken;
  } catch (e) {
    console.error("Error getting access token from session:", e);
    return undefined;
  }
}

export async function hasAuthCookies(): Promise<boolean> {
  try {
    const session = await auth();
    if (session?.accessToken) {
      return true;
    }

    const cookieStore = await cookies();
    return (
      !!cookieStore.get("access_token")?.value ||
      !!cookieStore.get("refresh_token")?.value
    );
  } catch (e) {
    console.error("Error checking authentication state:", e);
    return false;
  }
}

export async function refreshAccessToken(
  _nextApiUrl?: string,
): Promise<string | undefined> {
  try {
    const session = await unstable_update({});
    if (!session || session.error || !session.accessToken) {
      return undefined;
    }

    return session.accessToken;
  } catch (e) {
    console.error("Error refreshing token via NextAuth session:", e);
    return undefined;
  }
}

export async function clearAuthCookies(): Promise<Result<null, AppError>> {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    cookieStore.delete("mercureAuthorization");

    return Ok(null);
  } catch (error) {
    return Err(
      new AppError({
        message: "Failed to clear authentication cookies",
        code: "UNKNOWN_ERROR",
        status: 500,
        originalError: error,
      }),
    );
  }
}

export async function revokeRefreshToken(): Promise<Result<null, AppError>> {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const refreshToken =
      session?.refreshToken || cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return Err(
        new AppError({
          message: "No refresh token found",
          code: "NOT_FOUND",
          status: 404,
          severity: "warning",
        }),
      );
    }

    const apiUrl = getApiUrl();
    if (!apiUrl) {
      return Err(
        new AppError({
          message: "API URL not found",
          code: "SERVER_CONFIG_ERROR",
          status: 500,
        }),
      );
    }

    await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    return Ok(null);
  } catch (error) {
    return Err(
      new AppError({
        message: "Failed to revoke refresh token",
        code: "UNKNOWN_ERROR",
        status: 500,
        originalError: error,
      }),
    );
  }
}
