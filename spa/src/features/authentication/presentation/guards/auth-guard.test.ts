import { describe, it, expect, vi, beforeEach } from "vitest"
import type { QueryClient } from "@tanstack/react-query"
import { isRedirect } from "@tanstack/react-router"
import type { User } from "../../domain/models/user"
import { authKeys } from "../../application/auth-keys"
import {
  requireAuth,
  requireGuest,
  formatRedirectUrl,
  type AuthGuardLocation,
} from "./auth-guard"

describe("Auth Guards", () => {
  const dummyUser: User = {
    id: 1,
    email: "john@example.com",
    roles: ["ROLE_USER"],
    username: "john",
  }

  describe("formatRedirectUrl", () => {
    it("returns /organizations when location is root or empty", () => {
      expect(formatRedirectUrl({ pathname: "/" })).toBe("/organizations")
      expect(formatRedirectUrl({ pathname: "" })).toBe("/organizations")
    })

    it("strips /spa router basepath prefix from pathname", () => {
      expect(formatRedirectUrl({ pathname: "/spa/organizations" })).toBe(
        "/organizations"
      )
    })

    it("prefers href if available and strips /spa basepath prefix", () => {
      expect(
        formatRedirectUrl({
          pathname: "/spa/organizations",
          href: "/spa/organizations?page=2",
        })
      ).toBe("/organizations?page=2")
    })

    it("preserves valid query parameters", () => {
      expect(
        formatRedirectUrl({
          pathname: "/organizations",
          href: "/organizations?tab=members",
        })
      ).toBe("/organizations?tab=members")
    })

    it("sanitizes auth loop paths to /organizations", () => {
      expect(formatRedirectUrl({ pathname: "/signin" })).toBe("/organizations")
      expect(formatRedirectUrl({ pathname: "/signup" })).toBe("/organizations")
      expect(formatRedirectUrl({ pathname: "/spa/signin" })).toBe(
        "/organizations"
      )
      expect(formatRedirectUrl({ pathname: "/logout" })).toBe("/organizations")
    })
  })

  describe("requireAuth", () => {
    let mockQueryClient: {
      ensureQueryData: ReturnType<typeof vi.fn>
    }
    const location: AuthGuardLocation = {
      pathname: "/organizations",
      href: "/organizations",
    }

    beforeEach(() => {
      mockQueryClient = {
        ensureQueryData: vi.fn(),
      }
    })

    it("returns { user } when user is cached in TanStack Query", async () => {
      mockQueryClient.ensureQueryData.mockResolvedValueOnce(dummyUser)

      const result = await requireAuth({
        queryClient: mockQueryClient as unknown as QueryClient,
        location,
      })

      expect(result).toEqual({ user: dummyUser })
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: authKeys.currentUser(),
        })
      )
    })

    it("calls custom fetchUser when provided and returns { user }", async () => {
      const customFetch = vi.fn().mockResolvedValue(dummyUser)
      mockQueryClient.ensureQueryData.mockImplementationOnce(
        ({ queryFn }: { queryFn: () => Promise<User | null> }) => queryFn()
      )

      const result = await requireAuth({
        queryClient: mockQueryClient as unknown as QueryClient,
        location,
        fetchUser: customFetch,
      })

      expect(result).toEqual({ user: dummyUser })
      expect(customFetch).toHaveBeenCalledTimes(1)
    })

    it("throws a redirect to /signin with redirectUrl when user is null", async () => {
      mockQueryClient.ensureQueryData.mockResolvedValueOnce(null)

      try {
        await requireAuth({
          queryClient: mockQueryClient as unknown as QueryClient,
          location,
        })
        expect.fail("Should have thrown a redirect")
      } catch (error) {
        expect(isRedirect(error)).toBe(true)
        const redirectError = error as {
          options: {
            to: string
            search?: { redirectUrl: string }
          }
        }
        expect(redirectError.options.to).toBe("/signin")
        expect(redirectError.options.search).toEqual({
          redirectUrl: "/organizations",
        })
      }
    })

    it("throws a redirect to /signin preserving query string in redirectUrl", async () => {
      mockQueryClient.ensureQueryData.mockResolvedValueOnce(null)
      const locationWithQuery: AuthGuardLocation = {
        pathname: "/spa/organizations",
        href: "/spa/organizations?page=3",
      }

      try {
        await requireAuth({
          queryClient: mockQueryClient as unknown as QueryClient,
          location: locationWithQuery,
        })
        expect.fail("Should have thrown a redirect")
      } catch (error) {
        expect(isRedirect(error)).toBe(true)
        const redirectError = error as {
          options: {
            to: string
            search?: { redirectUrl: string }
          }
        }
        expect(redirectError.options.to).toBe("/signin")
        expect(redirectError.options.search).toEqual({
          redirectUrl: "/organizations?page=3",
        })
      }
    })

    it("throws a redirect to /signin when ensureQueryData throws an exception", async () => {
      mockQueryClient.ensureQueryData.mockRejectedValueOnce(
        new Error("Network error")
      )

      try {
        await requireAuth({
          queryClient: mockQueryClient as unknown as QueryClient,
          location,
        })
        expect.fail("Should have thrown a redirect")
      } catch (error) {
        expect(isRedirect(error)).toBe(true)
        const redirectError = error as { options: { to: string } }
        expect(redirectError.options.to).toBe("/signin")
      }
    })
  })

  describe("requireGuest", () => {
    let mockQueryClient: {
      ensureQueryData: ReturnType<typeof vi.fn>
    }

    beforeEach(() => {
      mockQueryClient = {
        ensureQueryData: vi.fn(),
      }
    })

    it("allows access when user is not authenticated (user is null)", async () => {
      mockQueryClient.ensureQueryData.mockResolvedValueOnce(null)

      await expect(
        requireGuest({
          queryClient: mockQueryClient as unknown as QueryClient,
        })
      ).resolves.toBeUndefined()
    })

    it("allows access when ensureQueryData throws an error", async () => {
      mockQueryClient.ensureQueryData.mockRejectedValueOnce(
        new Error("Session check error")
      )

      await expect(
        requireGuest({
          queryClient: mockQueryClient as unknown as QueryClient,
        })
      ).resolves.toBeUndefined()
    })

    it("throws a redirect to /organizations when user is authenticated", async () => {
      mockQueryClient.ensureQueryData.mockResolvedValueOnce(dummyUser)

      try {
        await requireGuest({
          queryClient: mockQueryClient as unknown as QueryClient,
        })
        expect.fail("Should have thrown a redirect")
      } catch (error) {
        expect(isRedirect(error)).toBe(true)
        const redirectError = error as { options: { to: string } }
        expect(redirectError.options.to).toBe("/organizations")
      }
    })
  })
})
