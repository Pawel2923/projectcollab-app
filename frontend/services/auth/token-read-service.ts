"use server";

import { cookies } from "next/headers";

export async function getAccessTokenReadOnly(): Promise<string | undefined> {
  try {
    return (await cookies()).get("access_token")?.value;
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
