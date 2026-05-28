"use server";

import { cookies } from "next/headers";

import { getApiUrl } from "@/utils/get-api-url";

import { logToServer } from "../log/server-logger";

export async function getOrRefreshAccessToken(
  nextApiUrl: string,
): Promise<string | undefined> {
  try {
    let token = (await cookies()).get("access_token")?.value;
    if (!token) {
      token = await refreshAccessToken(nextApiUrl);
    }

    return token;
  } catch (e) {
    console.error(e);
    return;
  }
}

export async function hasAuthCookies(): Promise<boolean> {
  try {
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
  nextApiUrl: string,
): Promise<string | undefined> {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (refreshToken) {
    const res = await fetch(`${nextApiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const newToken = data?.token;

      if (newToken) {
        cookieStore.set("access_token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 5, // 5 minutes
        });

        const newRefreshToken = data?.refresh_token;
        if (newRefreshToken) {
          cookieStore.set("refresh_token", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
        }
      }

      return newToken;
    }
  }
}

export async function clearAuthCookies(): Promise<boolean> {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return true;
  } catch (error) {
    await logToServer({
      level: "error",
      message: "Failed to clear authentication cookies",
      serviceName: "tokenService.clearAuthCookies",
      context: { error: String(error) },
      errorStack: (error as Error)?.stack,
    });
    return false;
  }
}

export async function revokeRefreshToken(): Promise<boolean> {
  const nextApiUrl = getApiUrl();
  if (!nextApiUrl) {
    await logToServer({
      level: "error",
      message: "API URL not found when revoking refresh token",
      serviceName: "tokenService.revokeRefreshToken",
    });

    return false;
  }

  const refreshToken = (await cookies()).get("refresh_token")?.value;
  if (!refreshToken) {
    await logToServer({
      level: "warn",
      message: "No refresh token found when attempting to revoke",
      serviceName: "tokenService.revokeRefreshToken",
    });

    return false;
  }

  try {
    await fetch(`${nextApiUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    return true;
  } catch (error) {
    await logToServer({
      level: "error",
      message: "Failed to revoke refresh token",
      serviceName: "tokenService.revokeRefreshToken",
      context: { error: String(error) },
      errorStack: (error as Error)?.stack,
    });

    return false;
  }
}
