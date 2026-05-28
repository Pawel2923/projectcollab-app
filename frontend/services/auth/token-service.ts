"use server";

import { cookies } from "next/headers";

import { getApiUrl } from "@/utils/get-api-url";
import type { Result } from "@/utils/result";
import { Err, Ok } from "@/utils/result";

import { AppError } from "../error/app-error";

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

export async function clearAuthCookies(): Promise<Result<null, AppError>> {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

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
    const refreshToken = (await cookies()).get("refresh_token")?.value;
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
