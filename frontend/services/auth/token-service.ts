"use server";

import { cookies } from "next/headers";

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
      const newToken = (await res.json())?.token;

      if (newToken) {
        cookieStore.set("access_token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 5, // 5 minutes
        });
      }

      return newToken;
    }
  }
}
