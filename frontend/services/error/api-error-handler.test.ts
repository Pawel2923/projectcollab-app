import { redirect } from "next/navigation";
import { describe, expect, it } from "vitest";

import { handleApiError } from "./api-error-handler";
import { AppError } from "./app-error";

describe("handleApiError", () => {
  it("should re-throw Next.js redirect errors", () => {
    expect(() => {
      try {
        redirect("/signin");
      } catch (error) {
        handleApiError(error, "Test context");
      }
    }).toThrow();
  });

  it("should re-throw redirect errors with NEXT_REDIRECT digest", () => {
    const error = new Error("NEXT_REDIRECT");
    (error as unknown as { digest: string }).digest =
      "NEXT_REDIRECT;replace;/login;307;";

    expect(() => {
      handleApiError(error, "Test context");
    }).toThrow();
  });

  it("should handle AppError properly without throwing", () => {
    const appError = new AppError({
      message: "Resource not found",
      code: "NOT_FOUND",
      status: 404,
      context: "User lookup",
    });

    const result = handleApiError(appError, "User lookup");
    expect(result).toEqual({
      ok: false,
      code: "NOT_FOUND",
      status: 404,
      message: "Resource not found",
      violations: undefined,
    });
  });

  it("should handle standard errors as UNKNOWN_ERROR", () => {
    const error = new Error("Database crashed");
    const result = handleApiError(error, "Database query");

    expect(result).toEqual({
      ok: false,
      code: "UNKNOWN_ERROR",
      status: 500,
      message: "Database crashed",
    });
  });
});
