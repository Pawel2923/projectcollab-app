import { cookies } from "next/headers";

import { signOut } from "@/auth";
import { getApiUrl } from "@/utils/get-api-url";

export async function GET() {
  const cookieStore = await cookies();

  // If a refresh token exists, revoke it on the backend first
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const nextApiUrl = getApiUrl();
  if (refreshToken && nextApiUrl) {
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
    } catch (error) {
      console.error("Backend refresh token revocation failed:", error);
    }
  }

  // Clear app cookies
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  await signOut({ redirectTo: "/signin" });
}
