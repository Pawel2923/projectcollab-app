import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logToServer } from "@/services/log/server-logger";

const PROXY_SERVICE_NAME = "proxy.middleware";

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
    await logToServer({
      level: "debug",
      message: "Proxy skipped for public route",
      serviceName: PROXY_SERVICE_NAME,
      context: {
        pathname: request.nextUrl.pathname,
      },
    });

    return NextResponse.next();
  }

  const session = request.auth;

  await logToServer({
    level: "debug",
    message: "Proxy evaluated authenticated request",
    serviceName: PROXY_SERVICE_NAME,
    context: {
      pathname: request.nextUrl.pathname,
      hasSession: Boolean(session),
      hasSessionAccessToken: Boolean(session?.accessToken),
      hasSessionError: Boolean(session?.error),
    },
  });

  if (session && session.accessToken && !session.error) {
    return NextResponse.next();
  }

  await logToServer({
    level: "info",
    message: "Proxy redirecting unauthenticated request to signin",
    serviceName: PROXY_SERVICE_NAME,
    context: {
      pathname: request.nextUrl.pathname,
      sessionError: session?.error,
    },
  });

  const signInUrl = new URL("/signin", request.url);
  signInUrl.searchParams.set("redirectUrl", request.nextUrl.pathname);
  const response = NextResponse.redirect(signInUrl);

  // Clean up any legacy cookies if present
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and auth pages
     */
    "/((?!_next|favicon.ico|manifest.json|web-app-manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|ico)$|signin|signup|reset-password|verify-email|email-verified|api).*)",
  ],
};
