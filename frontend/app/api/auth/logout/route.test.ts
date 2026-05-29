/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test, vi } from "vitest";

import { POST } from "./route";

const mockRevoke = vi.fn();
const mockClear = vi.fn();
const mockSignOut = vi.fn();
const mockLogError = vi.fn();
const mockLogToServer = vi.fn();
const mockIsOk = vi.fn();

vi.mock("@/services/auth/token-service", () => ({
  revokeRefreshToken: (...args: any[]) => mockRevoke(...args),
  clearAuthCookies: (...args: any[]) => mockClear(...args),
}));

vi.mock("@/auth", () => ({
  signOut: (...args: any[]) => mockSignOut(...args),
}));

vi.mock("@/services/error/error-logger", () => ({
  logError: (...args: any[]) => mockLogError(...args),
}));

vi.mock("@/services/log/server-logger", () => ({
  logToServer: (...args: any[]) => mockLogToServer(...args),
}));

vi.mock("@/utils/result", () => ({
  isOk: (...args: any[]) => mockIsOk(...args),
}));

describe("api.auth.logout POST", () => {
  test("should return 200 and LogoutResponse on successful logout", async () => {
    const revokeResult = { success: true };
    const clearResult = { success: true };
    const redirect = { ok: true, url: "/signin" };

    mockRevoke.mockResolvedValue(revokeResult);
    mockClear.mockResolvedValue(clearResult);
    mockIsOk.mockImplementation((r) => r === revokeResult || r === clearResult);
    mockSignOut.mockResolvedValue(redirect);

    const res = await POST();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(redirect);
    expect(mockLogError).not.toHaveBeenCalled();
  });

  test("should log error and continue logout flow if revokeRefreshToken fails", async () => {
    const revokeResult = { error: new Error("revoke failed") };
    const clearResult = { success: true };
    const redirect = { ok: true, url: "/signin" };

    mockRevoke.mockResolvedValue(revokeResult);
    mockClear.mockResolvedValue(clearResult);
    mockIsOk.mockImplementation((r) => r === clearResult);
    mockSignOut.mockResolvedValue(redirect);

    const res = await POST();

    expect(res.status).toBe(200);
    expect(mockLogError).toHaveBeenCalledWith(revokeResult.error);
    const body = await res.json();
    expect(body).toEqual(redirect);
  });

  test("should log error and return 500 if clearAuthCookies fails", async () => {
    const revokeResult = { success: true };
    const clearResult = { error: new Error("clear failed") };

    mockRevoke.mockResolvedValue(revokeResult);
    mockClear.mockResolvedValue(clearResult);
    mockIsOk.mockImplementation((r) => r === revokeResult);

    const res = await POST();

    expect(mockLogError).toHaveBeenCalledWith(clearResult.error);
    expect(res.status).toBe(500);
  });

  test("should log error and return 500 if an unexpected error occurs", async () => {
    mockRevoke.mockRejectedValue(new Error("boom"));

    const res = await POST();

    expect(mockLogToServer).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });
});
