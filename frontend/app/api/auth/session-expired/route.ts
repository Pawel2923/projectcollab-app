import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get("redirect") || "/organizations";

  cookieStore.delete("access_token");
  return redirect(redirectUrl);
}
