import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getServerApiUrl } from "@/utils/server-api-url";

export const proxy = auth(async (request) => {
  // Skip for public routes and API routes
  if (
    request.nextUrl.pathname.startsWith("/signin") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/reset-password") ||
    request.nextUrl.pathname.startsWith("/verify-email") ||
    request.nextUrl.pathname.startsWith("/email-verified") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/manifest.json") ||
    request.nextUrl.pathname.startsWith("/web-app-manifest") ||
    request.nextUrl.pathname.startsWith("/policy") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/logout"
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const session = request.auth;

  if (session && session.accessToken) {
    if (session.error === "RefreshAccessTokenError") {
      console.log(
        "Middleware: Session has RefreshAccessTokenError. Redirecting to signin.",
      );
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("redirectUrl", request.nextUrl.pathname);
      const response = NextResponse.redirect(signInUrl);

      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }

    if (!accessToken) {
      const response = NextResponse.next();
      response.cookies.set("access_token", session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5, // 5 minutes
      });

      if (session.refreshToken && !refreshToken) {
        response.cookies.set("refresh_token", session.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }
      return response;
    }

    if (session.refreshToken && !refreshToken) {
      const response = NextResponse.next();
      response.cookies.set("refresh_token", session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return response;
    }
    return NextResponse.next();
  }

  if (accessToken) {
    return NextResponse.next();
  }

  if (refreshToken) {
    try {
      const nextApiUrl = getServerApiUrl();
      if (!nextApiUrl) {
        const signInUrl = new URL("/signin", request.url);
        signInUrl.searchParams.set("redirectUrl", request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
      }

      const refreshResponse = await fetch(`${nextApiUrl}/auth/refresh`, {
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

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const newToken = data?.token;

        if (newToken) {
          const response = NextResponse.next();

          // Propagate new token to request cookies for downstream components
          response.cookies.set("access_token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 5, // 5 minutes
          });

          response.cookies.set("access_token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 5, // 5 minutes
          });

          // Capture Mercure cookie if present
          const setCookie = refreshResponse.headers.get("set-cookie");
          if (setCookie) {
            const match = setCookie.match(/mercureAuthorization=([^;]+)/);
            if (match) {
              response.cookies.set("mercureAuthorization", match[1], {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60, // 1 hour
              });
            }
          }

          return response;
        }
      }
    } catch (error) {
      console.error("Token refresh failed in middleware:", error);
    }
  }

  const signInUrl = new URL("/signin", request.url);
  signInUrl.searchParams.set("redirectUrl", request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and auth pages
     */
    "/((?!_next|favicon.ico|manifest.json|web-app-manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|ico)$|signin|signup|reset-password|verify-email|email-verified|api).*)",
  ],
};
