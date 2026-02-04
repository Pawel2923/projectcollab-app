import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get("redirect") || "/organizations";

  // clear access_token to force middleware refresh
  cookieStore.delete("access_token");

  // Redirect back to the requested page (or default)
  // The middleware will see no access_token, but valid refresh_token, and attempt refresh
  return redirect(redirectUrl);
}
