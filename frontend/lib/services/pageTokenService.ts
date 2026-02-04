"use server";

import { cookies } from "next/headers";

/**
 * Get access token for use in Server Components (pages)
 */
export async function getAccessTokenReadOnly(): Promise<string | undefined> {
  try {
    const token = (await cookies()).get("access_token")?.value;
    return token;
  } catch (e) {
    console.error("Error reading access token:", e);
    return undefined;
  }
}

export async function hasRefreshToken(): Promise<boolean> {
  try {
    const refreshToken = (await cookies()).get("refresh_token")?.value;
    return !!refreshToken;
  } catch (e) {
    console.error("Error checking refresh token:", e);
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const hasAccess = !!(await getAccessTokenReadOnly());
  const hasRefresh = await hasRefreshToken();
  return hasAccess || hasRefresh;
}
