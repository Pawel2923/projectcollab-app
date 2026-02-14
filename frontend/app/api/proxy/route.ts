import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AppError } from "@/error/app-error";
import { createErrorFromResponse } from "@/lib/utils/errorHandler";

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
        accepts: "application/json",
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

      if (newToken) {
        // Update the access token cookie
        cookieStore.set("access_token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 5, // 5 minutes
        });

        return newToken;
      }
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }

  return null;
}

async function handleProxyRequest(request: NextRequest, method: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      const error = new AppError({
        message: "Brak konfiguracji serwera API",
        code: "SERVER_CONFIG_ERROR",
        status: 500,
        context: "API Proxy",
      });
      return NextResponse.json(error.toJSON(), { status: 500 });
    }

    // Get the endpoint from query params
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

    // Get access token from cookies
    const cookieStore = await cookies();
    let token = cookieStore.get("access_token")?.value;

    if (!token) {
      // Try to refresh token if no access token exists
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

    // Parse body if present
    let body: Record<string, unknown> | undefined;
    if (method !== "GET" && method !== "DELETE") {
      try {
        body = await request.json();
      } catch {
        // No body or invalid JSON
      }
    }

    // Helper to make API request
    const makeApiRequest = async (authToken: string) => {
      const incomingContentType = request.headers.get("content-type");
      const contentType =
        incomingContentType === "application/merge-patch+json"
          ? "application/merge-patch+json"
          : "application/ld+json";

      return fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/ld+json",
          "Content-Type": contentType,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    // Make the actual API call
    let response = await makeApiRequest(token);

    // If 401, try refreshing token and retry once
    if (response.status === 401) {
      console.log("Got 401, attempting token refresh...");
      const newToken = await refreshToken(apiUrl);

      if (newToken) {
        console.log("Token refreshed, retrying request...");
        // Retry with new token
        response = await makeApiRequest(newToken);
      } else {
        console.log("Token refresh failed");
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

    // Forward Set-Cookie header if present
    const setCookieHeader = response.headers.get("set-cookie");

    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error("Proxy request error:", error);
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
