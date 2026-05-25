import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logToServer } from "@/services/log/server-logger";
import { getApiUrl } from "@/utils/get-api-url";

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

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const session = request.auth;

  await logToServer({
    level: "debug",
    message: "Proxy evaluated authenticated request",
    serviceName: PROXY_SERVICE_NAME,
    context: {
      pathname: request.nextUrl.pathname,
      hasAccessTokenCookie: Boolean(accessToken),
      hasRefreshTokenCookie: Boolean(refreshToken),
      hasSession: Boolean(session),
      hasSessionAccessToken: Boolean(session?.accessToken),
      hasSessionError: Boolean(session?.error),
    },
  });

  if (session && session.accessToken) {
    if (session.error === "RefreshAccessTokenError") {
      await logToServer({
        level: "warn",
        message: "Proxy redirecting due to session refresh error",
        serviceName: PROXY_SERVICE_NAME,
        context: {
          pathname: request.nextUrl.pathname,
        },
      });

      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("redirectUrl", request.nextUrl.pathname);
      const response = NextResponse.redirect(signInUrl);

      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }

    if (!accessToken) {
      await logToServer({
        level: "debug",
        message: "Proxy setting access token cookie from session",
        serviceName: PROXY_SERVICE_NAME,
        context: {
          pathname: request.nextUrl.pathname,
          hasRefreshToken: Boolean(session.refreshToken),
          hasRefreshTokenCookie: Boolean(refreshToken),
        },
      });

      const response = NextResponse.next();
      response.cookies.set("access_token", session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5, // 5 minutes
      });

      if (session.refreshToken && !refreshToken) {
        await logToServer({
          level: "debug",
          message: "Proxy setting refresh token cookie from session",
          serviceName: PROXY_SERVICE_NAME,
          context: {
            pathname: request.nextUrl.pathname,
          },
        });

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
      await logToServer({
        level: "debug",
        message: "Proxy setting refresh token cookie from session",
        serviceName: PROXY_SERVICE_NAME,
        context: {
          pathname: request.nextUrl.pathname,
        },
      });

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
    await logToServer({
      level: "debug",
      message: "Proxy allowed request with access token cookie",
      serviceName: PROXY_SERVICE_NAME,
      context: {
        pathname: request.nextUrl.pathname,
      },
    });

    return NextResponse.next();
  }

  if (refreshToken) {
    try {
      await logToServer({
        level: "debug",
        message: "Proxy attempting token refresh",
        serviceName: PROXY_SERVICE_NAME,
        context: {
          pathname: request.nextUrl.pathname,
        },
      });

      const nextApiUrl = getApiUrl();
      if (!nextApiUrl) {
        await logToServer({
          level: "error",
          message: "Proxy missing API URL during token refresh",
          serviceName: PROXY_SERVICE_NAME,
          context: {
            pathname: request.nextUrl.pathname,
          },
        });

        const signInUrl = new URL("/signin", request.url);
        signInUrl.searchParams.set("redirectUrl", request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
      }

      const refreshResponse = await fetch(`${nextApiUrl}/auth/refresh`, {
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

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const newToken = data?.token;

        await logToServer({
          level: "info",
          message: "Proxy token refresh succeeded",
          serviceName: PROXY_SERVICE_NAME,
          context: {
            pathname: request.nextUrl.pathname,
            hasToken: Boolean(newToken),
          },
        });

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

        await logToServer({
          level: "warn",
          message: "Proxy token refresh response missing token",
          serviceName: PROXY_SERVICE_NAME,
          context: {
            pathname: request.nextUrl.pathname,
          },
        });
      }

      await logToServer({
        level: "warn",
        message: "Proxy token refresh failed",
        serviceName: PROXY_SERVICE_NAME,
        context: {
          pathname: request.nextUrl.pathname,
          status: refreshResponse.status,
        },
      });
    } catch (error) {
      await logToServer({
        level: "error",
        message: "Token refresh failed in middleware",
        serviceName: PROXY_SERVICE_NAME,
        context: {
          pathname: request.nextUrl.pathname,
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      });
    }
  }

  await logToServer({
    level: "info",
    message: "Proxy redirecting to signin",
    serviceName: PROXY_SERVICE_NAME,
    context: {
      pathname: request.nextUrl.pathname,
      hasAccessTokenCookie: Boolean(accessToken),
      hasRefreshTokenCookie: Boolean(refreshToken),
    },
  });

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
