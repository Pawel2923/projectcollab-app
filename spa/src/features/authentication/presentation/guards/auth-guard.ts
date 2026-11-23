import { redirect } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import type { User } from "../../domain/models/user"
import { authKeys } from "../../application/auth-keys"
import { fetchCurrentUser } from "../context/UserContext"
import { getPostLoginRedirect } from "../../domain/services/auth-navigation"

export interface AuthGuardLocation {
  pathname: string
  search?: Record<string, unknown> | string
  href?: string
}

export interface AuthGuardOptions {
  queryClient: QueryClient
  location: AuthGuardLocation
  fetchUser?: () => Promise<User | null>
}

export interface GuestGuardOptions {
  queryClient: QueryClient
  fetchUser?: () => Promise<User | null>
}

export function formatRedirectUrl(location: AuthGuardLocation): string {
  const rawPath = location.href || location.pathname || "/organizations"
  const relativePath = rawPath.replace(/^\/spa/, "") || "/organizations"
  return getPostLoginRedirect(relativePath)
}

export async function requireAuth({
  queryClient,
  location,
  fetchUser = fetchCurrentUser,
}: AuthGuardOptions): Promise<{ user: User }> {
  let user: User | null

  try {
    user = await queryClient.ensureQueryData({
      queryKey: authKeys.currentUser(),
      queryFn: fetchUser,
      staleTime: 1000 * 60 * 5,
    })
  } catch {
    user = null
  }

  if (!user) {
    throw redirect({
      to: "/signin",
      search: {
        redirectUrl: formatRedirectUrl(location),
      },
    })
  }

  return { user }
}

export async function requireGuest({
  queryClient,
  fetchUser = fetchCurrentUser,
}: GuestGuardOptions): Promise<void> {
  let user: User | null

  try {
    user = await queryClient.ensureQueryData({
      queryKey: authKeys.currentUser(),
      queryFn: fetchUser,
      staleTime: 1000 * 60 * 5,
    })
  } catch {
    user = null
  }

  if (user) {
    throw redirect({
      to: "/organizations",
    })
  }
}
