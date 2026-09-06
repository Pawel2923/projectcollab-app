/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { isOk } from "@/utils/result";

import {
  requestTokenRefresh,
  resetActiveRefreshForTests,
} from "./refresh-token-manager";

vi.mock("@/utils/get-api-url", () => ({
  getApiUrl: () => "http://api/core-api",
}));

vi.mock("../log/server-logger", () => ({
  logToServer: vi.fn(),
}));

beforeEach(() => {
  resetActiveRefreshForTests();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  resetActiveRefreshForTests();
  vi.resetAllMocks();
});

describe("requestTokenRefresh", () => {
  test("should return Err when token is empty", async () => {
    const result = await requestTokenRefresh("");
    expect(isOk(result)).toBe(false);
    if (!isOk(result)) {
      expect(result.error).toBe("No refresh token provided");
    }
  });

  test("should successfully refresh token and invoke cookie callback", async () => {
    const mockCookieCallback = vi.fn().mockResolvedValue(undefined);
    const mockResponse = {
      ok: true,
      json: async () => ({
        token: "new-access-token",
        refresh_token: "new-refresh-token",
      }),
    };
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const result = await requestTokenRefresh(
      "initial-refresh-token",
      "http://api/core-api",
      mockCookieCallback,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.token).toBe("new-access-token");
      expect(result.value.refresh_token).toBe("new-refresh-token");
    }

    expect(global.fetch).toHaveBeenCalledWith(
      "http://api/core-api/auth/refresh",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: "initial-refresh-token" }),
      }),
    );
    expect(mockCookieCallback).toHaveBeenCalledWith(mockResponse);
  });

  test("should deduplicate concurrent refresh requests with the same token", async () => {
    let resolveFetch: (val: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    (global.fetch as any).mockImplementationOnce(() => fetchPromise);

    // Trigger two concurrent refresh calls simultaneously
    const call1 = requestTokenRefresh("concurrent-refresh-token");
    const call2 = requestTokenRefresh("concurrent-refresh-token");

    // Resolve the single fetch
    resolveFetch!({
      ok: true,
      json: async () => ({
        token: "deduped-token",
        refresh_token: "deduped-refresh",
      }),
    });

    const [result1, result2] = await Promise.all([call1, call2]);

    expect(isOk(result1)).toBe(true);
    expect(isOk(result2)).toBe(true);
    if (isOk(result1) && isOk(result2)) {
      expect(result1.value.token).toBe("deduped-token");
      expect(result2.value.token).toBe("deduped-token");
    }

    // Crucial: fetch was called exactly ONCE, avoiding race condition and token rotation failure!
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("should handle backend failure and return Err", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Invalid refresh token",
    });

    const result = await requestTokenRefresh("invalid-token");

    expect(isOk(result)).toBe(false);
    if (!isOk(result)) {
      expect(result.error).toBe("Invalid refresh token");
    }
  });

  test("should handle network exception and return Err", async () => {
    (global.fetch as any).mockRejectedValueOnce(
      new Error("Network disconnect"),
    );

    const result = await requestTokenRefresh("token-throwing");

    expect(isOk(result)).toBe(false);
    if (!isOk(result)) {
      expect(result.error).toBe("Network disconnect");
    }
  });
});
