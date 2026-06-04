/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { isOk, match } from "@/utils/result";

import * as tokenService from "./token-service";

let cookieStore: any;

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
  };

  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("getOrRefreshAccessToken", () => {
  test("should return existing access_token when present", async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === "access_token" ? { value: "existing" } : undefined,
    );

    const token = await tokenService.getOrRefreshAccessToken("http://api");

    expect(token).toBe("existing");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should call refreshAccessToken when access token missing", async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === "access_token"
        ? undefined
        : name === "refresh_token"
          ? { value: "r" }
          : undefined,
    );

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "new-token", refresh_token: "new-refresh" }),
    });

    const token = await tokenService.getOrRefreshAccessToken("http://api");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://api/auth/refresh",
      expect.objectContaining({ method: "POST" }),
    );

    expect(token).toBe("new-token");
  });

  test("should return undefined when cookies throw", async () => {
    cookieStore = {
      get: () => {
        throw new Error("boom");
      },
    };

    const token = await tokenService.getOrRefreshAccessToken("http://api");

    expect(token).toBeUndefined();
  });

  test("should return undefined when access_token is undefined and refreshOnUndefined is false", async () => {
    cookieStore.get.mockReturnValue(undefined);

    const token = await tokenService.getOrRefreshAccessToken(
      "http://api",
      false,
    );

    expect(token).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("hasAuthCookies", () => {
  test("should return true when access_token exists", async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === "access_token" ? { value: "a" } : undefined,
    );

    expect(await tokenService.hasAuthCookies()).toBe(true);
  });

  test("should return true when refresh_token exists", async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === "refresh_token" ? { value: "r" } : undefined,
    );

    expect(await tokenService.hasAuthCookies()).toBe(true);
  });

  test("should return false when neither cookie exists", async () => {
    cookieStore.get.mockReturnValue(undefined);
    expect(await tokenService.hasAuthCookies()).toBe(false);
  });

  test("should return false when cookies throw", async () => {
    cookieStore = {
      get: () => {
        throw new Error("err");
      },
    };
    expect(await tokenService.hasAuthCookies()).toBe(false);
  });
});

describe("refreshAccessToken", () => {
  test("should return undefined when no refresh token", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const token = await tokenService.refreshAccessToken("http://api");
    expect(token).toBeUndefined();
  });

  test("should call fetch and set cookie on success", async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === "refresh_token" ? { value: "r" } : undefined,
    );

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "new-token", refresh_token: "new-refresh" }),
    });

    vi.stubEnv("NODE_ENV", "production");

    const token = await tokenService.refreshAccessToken("http://api");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://api/auth/refresh",
      expect.objectContaining({ method: "POST" }),
    );

    expect(cookieStore.set).toHaveBeenCalledWith(
      "access_token",
      "new-token",
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
      }),
    );

    expect(cookieStore.set).toHaveBeenCalledWith(
      "refresh_token",
      "new-refresh",
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      }),
    );

    expect(token).toBe("new-token");
  });

  test("should return undefined when fetch not ok", async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === "refresh_token" ? { value: "r" } : undefined,
    );

    (global.fetch as any).mockResolvedValue({ ok: false });

    const token = await tokenService.refreshAccessToken("http://api");

    expect(token).toBeUndefined();
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  test("should not set cookie when response has no token", async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === "refresh_token" ? { value: "r" } : undefined,
    );

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const token = await tokenService.refreshAccessToken("http://api");

    expect(token).toBeUndefined();
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

describe("clearAuthCookies", async () => {
  test("should delete both cookies and return Ok", async () => {
    cookieStore.delete = vi.fn();

    const result = await tokenService.clearAuthCookies();

    expect(cookieStore.delete).toHaveBeenCalledWith("access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("refresh_token");
    expect(isOk(result)).toBe(true);
  });

  test("should return Err when delete throws", async () => {
    cookieStore.delete = vi.fn(() => {
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
  test("should call API to revoke token and return true", async () => {
    (globalThis as any).__API_URL = "http://api";

    cookieStore.get.mockImplementation((name: string) =>
      name === "refresh_token" ? { value: "r" } : undefined,
    );

    (global.fetch as any).mockResolvedValueOnce({});

    const result = await tokenService.revokeRefreshToken();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );

    expect(isOk(result)).toBe(true);
  });

  test("should return Err when API URL is not defined", async () => {
    (globalThis as any).__API_URL = undefined;
    cookieStore.get.mockImplementation((name: string) =>
      name === "refresh_token" ? { value: "r" } : undefined,
    );

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

    cookieStore.get.mockImplementation((name: string) =>
      name === "refresh_token" ? { value: "r" } : undefined,
    );

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
