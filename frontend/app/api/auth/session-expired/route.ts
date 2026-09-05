import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { signOut } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    await signOut({ redirect: false });
  } catch {
    // Ignore if no active session
  }

  const cookieStore = await cookies();
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get("redirect") || "/organizations";

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("mercureAuthorization");

  const signinUrl = redirectUrl.startsWith("/signin")
    ? redirectUrl
    : `/signin?redirectUrl=${encodeURIComponent(redirectUrl)}`;

  return redirect(signinUrl);
}
