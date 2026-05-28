import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AppError } from "@/services/error/app-error";
import { createErrorFromResponse } from "@/services/error/response-to-error";
import { logToServer } from "@/services/log/server-logger";
import { getApiUrl } from "@/utils/get-api-url";
import { buildEndpointUriFromIri } from "@/utils/iri-util";

/**
 * API Proxy route for client-side requests
 * This handles authentication using httpOnly cookies
 */
export async function GET(request: NextRequest) {
  return handleProxyRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return handleProxyRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return handleProxyRequest(request, "PUT");
}

export async function PATCH(request: NextRequest) {
  return handleProxyRequest(request, "PATCH");
}

export async function DELETE(request: NextRequest) {
  return handleProxyRequest(request, "DELETE");
}

async function refreshToken(apiUrl: string): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/auth/refresh`, {
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

    if (response.ok) {
      const data = await response.json();
      const newToken = data?.token;
      const newRefreshToken = data?.refresh_token;

      if (newToken) {
        cookieStore.set("access_token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 5, // 5 minutes
        });

        if (newRefreshToken) {
          cookieStore.set("refresh_token", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
        }

        return newToken;
      }
    }
  } catch (error) {
    await logToServer({
      level: "error",
      message: "Token refresh failed",
      serviceName: "route.api.proxy.refreshToken",
      context: { error: String(error) },
      errorStack: (error as Error)?.stack,
    });
  }

  return null;
}

async function handleProxyRequest(request: NextRequest, method: string) {
  try {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      const error = new AppError({
        message: "Brak konfiguracji serwera API",
        code: "SERVER_CONFIG_ERROR",
        status: 500,
        context: "API Proxy",
      });
      return NextResponse.json(error.toJSON(), { status: 500 });
    }

    const endpoint = request.nextUrl.searchParams.get("endpoint");
    if (!endpoint) {
      const error = new AppError({
        message: "Brak punktu końcowego API w żądaniu",
        code: "VALIDATION_ERROR",
        status: 400,
        context: "API Proxy",
      });
      return NextResponse.json(error.toJSON(), { status: 400 });
    }

    const cookieStore = await cookies();
    let token = cookieStore.get("access_token")?.value;

    if (!token) {
      const refreshedToken = await refreshToken(apiUrl);
      if (!refreshedToken) {
        const error = new AppError({
          message: "Sesja wygasła. Proszę zalogować się ponownie.",
          code: "UNAUTHORIZED",
          status: 401,
          context: "API Proxy",
        });
        return NextResponse.json(error.toJSON(), { status: 401 });
      }
      token = refreshedToken;
    }

    let body: Record<string, unknown> | undefined;
    if (method !== "GET" && method !== "DELETE") {
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          new AppError({
            message: "Nieprawidłowe dane JSON w body",
            code: "VALIDATION_ERROR",
            status: 400,
            context: "API Proxy",
          }).toJSON(),
          { status: 400 },
        );
      }
    }

    const makeApiRequest = async (authToken: string) => {
      const incomingContentType = request.headers.get("content-type");
      const contentType =
        incomingContentType === "application/merge-patch+json"
          ? "application/merge-patch+json"
          : "application/ld+json";

      return fetch(buildEndpointUriFromIri(apiUrl, endpoint), {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/ld+json",
          "Content-Type": contentType,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    let response = await makeApiRequest(token);

    if (response.status === 401) {
      await logToServer({
        level: "debug",
        message: "Got 401, attempting token refresh",
        serviceName: "route.api.proxy",
        context: { endpoint },
      });
      const newToken = await refreshToken(apiUrl);

      if (newToken) {
        await logToServer({
          level: "debug",
          message: "Token refreshed, retrying request",
          serviceName: "route.api.proxy",
          context: { endpoint },
        });
        response = await makeApiRequest(newToken);
      } else {
        await logToServer({
          level: "warn",
          message: "Token refresh failed",
          serviceName: "route.api.proxy",
          context: { endpoint },
        });
        const error = new AppError({
          message: "Sesja wygasła. Proszę zalogować się ponownie.",
          code: "UNAUTHORIZED",
          status: 401,
          context: "API Proxy",
        });
        return NextResponse.json(error.toJSON(), { status: 401 });
      }
    }

    if (!response.ok) {
      const error = await createErrorFromResponse(
        response,
        `${method} ${endpoint}`,
      );
      return NextResponse.json(error.toJSON(), { status: error.status });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data);

    const setCookieHeader = response.headers.get("set-cookie");

    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    await logToServer({
      level: "error",
      message: "Proxy request error",
      serviceName: "route.api.proxy",
      context: { error: String(error) },
      errorStack: (error as Error)?.stack,
    });
    const appError = new AppError({
      message:
        error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
      code: "UNKNOWN_ERROR",
      status: 500,
      context: "API Proxy",
      originalError: error,
    });
    return NextResponse.json(appError.toJSON(), { status: 500 });
  }
}
