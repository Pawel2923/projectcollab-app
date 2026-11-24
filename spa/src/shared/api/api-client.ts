import { ApiError } from "./api-error"

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  readonly body?: unknown
  readonly skipAuthRefresh?: boolean
  readonly skipAuthRedirect?: boolean
}

export type AuthFailureCallback = () => void

const authFailureCallbacks = new Set<AuthFailureCallback>()

export function onAuthFailure(callback: AuthFailureCallback): () => void {
  authFailureCallbacks.add(callback)
  return () => {
    authFailureCallbacks.delete(callback)
  }
}

export function notifyAuthFailure(): void {
  for (const callback of authFailureCallbacks) {
    try {
      callback()
    } catch (error: unknown) {
      console.error("Error in auth failure listener", error)
    }
  }
}

let refreshPromise: Promise<boolean> | null = null

/**
 * @deprecated Cookie-based auth makes the refresh-token resolver unnecessary.
 * The browser sends the refresh_token cookie automatically. Will be removed in a future version.
 */
export type RefreshTokenResolver = () => string | null | undefined

/**
 * @deprecated Cookie-based auth makes the refresh-token resolver unnecessary.
 * Will be removed in a future version.
 */
export function setRefreshTokenResolver(
  _resolver: RefreshTokenResolver | null
): void {
  // no-op — kept for backward compatibility with existing imports
}

/**
 * @deprecated Cookie-based auth — the new token is set as an HTTP-Only cookie.
 * Will be removed in a future version.
 */
export type TokenRefreshedCallback = (token: string) => void

/**
 * @deprecated Cookie-based auth — the new token is set as an HTTP-Only cookie.
 * Will be removed in a future version.
 */
export function onTokenRefreshed(
  _callback: TokenRefreshedCallback
): () => void {
  return () => {}
}

/**
 * @deprecated Cookie-based auth — the new token is set as an HTTP-Only cookie.
 * Will be removed in a future version.
 */
export function notifyTokenRefreshed(_token: string): void {
  // no-op — kept for backward compatibility with existing imports
}

export function formatApiUrl(endpoint: string): string {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint
  }
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  if (cleanEndpoint.startsWith("/core-api")) {
    return cleanEndpoint
  }
  return `/core-api${cleanEndpoint}`
}

/**
 * Exchanges the refresh-token cookie for a new access-token cookie.
 *
 * The browser sends the `refresh_token` HTTP-Only cookie automatically to
 * `/core-api/auth/refresh` — no manual token threading is required.
 *
 * @param _refreshToken - @deprecated Ignored. Cookie is used automatically.
 */
export async function refreshTokens(_refreshToken?: string): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch("/core-api/auth/refresh", {
        method: "POST",
        headers: {
          Accept: "application/ld+json, application/json",
          "X-Requested-With": "XMLHttpRequest",
          // No Content-Type — no body is sent; the refresh_token cookie is automatic
        },
        credentials: "include",
      })

      return response.ok
    } catch (error: unknown) {
      console.error("Token refresh network failure", error)
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function prepareRequestBody(
  body: unknown,
  headers: Headers
): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined
  }

  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams
  ) {
    return body
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  return JSON.stringify(body)
}

function handleAuthRedirection(skipAuthRedirect?: boolean): void {
  if (skipAuthRedirect || typeof window === "undefined") {
    return
  }
  const currentPath = window.location.pathname
  if (!currentPath.includes("/signin") && !currentPath.includes("/signup")) {
    window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    body,
    headers: customHeaders = {},
    skipAuthRefresh = false,
    skipAuthRedirect = false,
    ...fetchOptions
  } = options

  const url = formatApiUrl(endpoint)
  const isAuthEndpoint =
    url.includes("/auth/login") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")

  const headers = new Headers(customHeaders as HeadersInit)

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/ld+json, application/json")
  }

  if (!headers.has("X-Requested-With")) {
    headers.set("X-Requested-With", "XMLHttpRequest")
  }

  const finalBody = prepareRequestBody(body, headers)

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    body: finalBody,
    credentials: "include",
  })

  if (response.status === 401 && !isAuthEndpoint) {
    if (!skipAuthRefresh) {
      const refreshed = await refreshTokens()
      if (refreshed) {
        return apiFetch<T>(endpoint, {
          ...options,
          skipAuthRefresh: true,
        })
      }
    }

    notifyAuthFailure()
    handleAuthRedirection(skipAuthRedirect)
    throw new ApiError(401, null, "Session expired")
  }

  if (response.status === 204) {
    return null as T
  }

  const contentType = response.headers.get("content-type") || ""
  const normalizedContentType = contentType.toLowerCase()
  let responseData: unknown
  if (
    normalizedContentType.includes("application/json") ||
    normalizedContentType.includes("+json")
  ) {
    responseData = await response.json().catch(() => null)
  } else {
    responseData = await response.text().catch(() => null)
  }

  if (!response.ok) {
    throw new ApiError(response.status, responseData)
  }

  return responseData as T
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ) => apiFetch<T>(endpoint, { ...options, method: "POST", body }),

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ) => apiFetch<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ) => {
    const headers = new Headers(options?.headers as HeadersInit)
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/merge-patch+json")
    }
    return apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      headers,
      body,
    })
  },

  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
}
