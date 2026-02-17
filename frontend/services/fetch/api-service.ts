"use server";

import { redirect } from "next/navigation";

import { getAccessTokenReadOnly } from "@/services/auth/token-read-service";

interface ApiCallOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: object;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Standardized API call utility for Server Components (pages)
 * Handles authentication, error handling, and response parsing
 */
export async function apiCall<T = unknown>(
  endpoint: string,
  options: ApiCallOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, requireAuth = true } = options;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL not configured");
      return {
        data: null,
        error: "Server configuration error",
        status: 500,
      };
    }

    if (requireAuth) {
      const token = await getAccessTokenReadOnly();
      if (!token) {
        // Redirect to session expired handler to trigger refresh loop
        redirect("/api/auth/session-expired?redirect=/organizations");
      }
      headers.Authorization = `Bearer ${token}`;
    }

    if (!headers.accept) {
      headers.accept = "application/ld+json";
    }
    if (body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (response.status === 403) {
      // Redirect to organizations list with error parameter query
      redirect("/organizations?error=access_denied");
    }

    const data = response.ok ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      console.error(`API call failed: ${method} ${endpoint}`, response.status);
      return {
        data: null,
        error: `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    // Re-throw Next.js redirects
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error(`API call error: ${method} ${endpoint}`, error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}

/**
 * Convenience function for GET requests
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  requireAuth: boolean = true,
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { method: "GET", requireAuth });
}

export async function apiPost<T = unknown>(
  endpoint: string,
  body: object,
  requireAuth: boolean = true,
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { method: "POST", body, requireAuth });
}

export async function apiDelete<T = unknown>(
  endpoint: string,
  requireAuth: boolean = true,
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { method: "DELETE", requireAuth });
}

export async function rethrowIfRedirect(error: unknown): Promise<void> {
  if (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }
}
