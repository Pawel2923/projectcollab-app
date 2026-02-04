"use server";

import { cookies } from "next/headers";

export async function getAccessToken(
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

async function refreshAccessToken(
  nextApiUrl: string,
): Promise<string | undefined> {
  const refreshToken = (await cookies()).get("refresh_token")?.value;
  if (refreshToken) {
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

    if (res.ok) {
      const newToken = (await res.json())?.token;

      if (newToken) {
        (await cookies()).set("access_token", newToken, {
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
