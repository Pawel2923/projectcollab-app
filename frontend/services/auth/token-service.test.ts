/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { isOk, match } from "@/utils/result";

import * as tokenService from "./token-service";

let cookieStore: any;
const mockAuth = vi.fn();
const mockUnstableUpdate = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
  unstable_update: (data: any) => mockUnstableUpdate(data),
}));

vi.mock("next/headers", () => {
  return {
    cookies: async () => cookieStore,
  };
});

vi.mock("@/utils/get-api-url", () => ({
  getApiUrl: () => (globalThis as any).__API_URL,
}));

vi.mock("../log/server-logger", () => ({
  logToServer: vi.fn(),
}));

beforeEach(() => {
  cookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  mockAuth.mockReset();
  mockUnstableUpdate.mockReset();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("getOrRefreshAccessToken", () => {
  test("should return access token from active session", async () => {
    mockAuth.mockResolvedValue({ accessToken: "session-token" });

    const token = await tokenService.getOrRefreshAccessToken("http://api");

    expect(token).toBe("session-token");
  });

  test("should return undefined when session is null", async () => {
    mockAuth.mockResolvedValue(null);

    const token = await tokenService.getOrRefreshAccessToken("http://api");

    expect(token).toBeUndefined();
  });

  test("should return undefined when session has error", async () => {
    mockAuth.mockResolvedValue({
      accessToken: "session-token",
      error: "RefreshAccessTokenError",
    });

    const token = await tokenService.getOrRefreshAccessToken("http://api");

    expect(token).toBeUndefined();
  });

  test("should return undefined when session has no accessToken", async () => {
    mockAuth.mockResolvedValue({});

    const token = await tokenService.getOrRefreshAccessToken("http://api");

    expect(token).toBeUndefined();
  });

  test("should return undefined when auth throws", async () => {
    mockAuth.mockRejectedValue(new Error("Auth failure"));

    const token = await tokenService.getOrRefreshAccessToken("http://api");

    expect(token).toBeUndefined();
  });
});

describe("hasAuthCookies", () => {
  test("should return true when session has access token", async () => {
    mockAuth.mockResolvedValue({ accessToken: "token-123" });

    expect(await tokenService.hasAuthCookies()).toBe(true);
  });

  test("should fall back to cookieStore when session is absent and cookie exists", async () => {
    mockAuth.mockResolvedValue(null);
    cookieStore.get.mockImplementation((name: string) =>
      name === "access_token" ? { value: "a" } : undefined,
    );

    expect(await tokenService.hasAuthCookies()).toBe(true);
  });

  test("should return false when neither session nor cookies exist", async () => {
    mockAuth.mockResolvedValue(null);
    cookieStore.get.mockReturnValue(undefined);

    expect(await tokenService.hasAuthCookies()).toBe(false);
  });

  test("should return false when an error occurs", async () => {
    mockAuth.mockRejectedValue(new Error("boom"));

    expect(await tokenService.hasAuthCookies()).toBe(false);
  });
});

describe("refreshAccessToken", () => {
  test("should call unstable_update and return new access token", async () => {
    mockUnstableUpdate.mockResolvedValue({ accessToken: "refreshed-token" });

    const token = await tokenService.refreshAccessToken();

    expect(mockUnstableUpdate).toHaveBeenCalledWith({});
    expect(token).toBe("refreshed-token");
  });

  test("should return undefined when unstable_update returns session error", async () => {
    mockUnstableUpdate.mockResolvedValue({
      accessToken: "token",
      error: "RefreshAccessTokenError",
    });

    const token = await tokenService.refreshAccessToken();

    expect(token).toBeUndefined();
  });

  test("should return undefined when unstable_update returns null", async () => {
    mockUnstableUpdate.mockResolvedValue(null);

    const token = await tokenService.refreshAccessToken();

    expect(token).toBeUndefined();
  });

  test("should return undefined when unstable_update throws", async () => {
    mockUnstableUpdate.mockRejectedValue(new Error("update error"));

    const token = await tokenService.refreshAccessToken();

    expect(token).toBeUndefined();
  });
});

describe("clearAuthCookies", () => {
  test("should delete cookies and return Ok", async () => {
    const result = await tokenService.clearAuthCookies();

    expect(cookieStore.delete).toHaveBeenCalledWith("access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("refresh_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("mercureAuthorization");
    expect(isOk(result)).toBe(true);
  });

  test("should return Err when delete throws", async () => {
    cookieStore.delete.mockImplementation(() => {
      throw new Error("delete failed");
    });

    const result = await tokenService.clearAuthCookies();

    match(result, {
      ok: () => {
        throw new Error("Expected Err result");
      },
      err: (error) => {
        expect(error.message).toContain(
          "Failed to clear authentication cookies",
        );
        expect(error.code).toBe("UNKNOWN_ERROR");
      },
    });
  });
});

describe("revokeRefreshToken", () => {
  test("should call API to revoke token from session and return Ok", async () => {
    (globalThis as any).__API_URL = "http://api";
    mockAuth.mockResolvedValue({ refreshToken: "session-refresh-token" });
    (global.fetch as any).mockResolvedValueOnce({});

    const result = await tokenService.revokeRefreshToken();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://api/auth/logout",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refresh_token: "session-refresh-token" }),
      }),
    );

    expect(isOk(result)).toBe(true);
  });

  test("should fallback to cookie if session has no refreshToken", async () => {
    (globalThis as any).__API_URL = "http://api";
    mockAuth.mockResolvedValue(null);
    cookieStore.get.mockImplementation((name: string) =>
      name === "refresh_token" ? { value: "cookie-refresh-token" } : undefined,
    );
    (global.fetch as any).mockResolvedValueOnce({});

    const result = await tokenService.revokeRefreshToken();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://api/auth/logout",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refresh_token: "cookie-refresh-token" }),
      }),
    );

    expect(isOk(result)).toBe(true);
  });

  test("should return Err when API URL is not defined", async () => {
    (globalThis as any).__API_URL = undefined;
    mockAuth.mockResolvedValue({ refreshToken: "r" });

    const result = await tokenService.revokeRefreshToken();

    match(result, {
      ok: () => {
        throw new Error("Expected Err result");
      },
      err: (error) => {
        expect(error.code).toBe("SERVER_CONFIG_ERROR");
        expect(error.status).toBe(500);
      },
    });
  });

  test("should return Err when refresh token is not found", async () => {
    (globalThis as any).__API_URL = "http://api";
    mockAuth.mockResolvedValue(null);
    cookieStore.get.mockReturnValue(undefined);

    const result = await tokenService.revokeRefreshToken();

    match(result, {
      ok: () => {
        throw new Error("Expected Err result");
      },
      err: (error) => {
        expect(error.code).toBe("NOT_FOUND");
        expect(error.status).toBe(404);
        expect(error.severity).toBe("warning");
      },
    });
  });

  test("should return Err when fetch throws", async () => {
    (globalThis as any).__API_URL = "http://api";
    mockAuth.mockResolvedValue({ refreshToken: "r" });
    (global.fetch as any).mockRejectedValueOnce(new Error("boom"));

    const result = await tokenService.revokeRefreshToken();

    match(result, {
      ok: () => {
        throw new Error("Expected Err result");
      },
      err: (error) => {
        expect(error.code).toBe("UNKNOWN_ERROR");
        expect(error.status).toBe(500);
      },
    });
  });
});
