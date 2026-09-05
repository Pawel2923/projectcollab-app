import { redirect } from "next/navigation";
import { describe, expect, it } from "vitest";

import { isRedirectError, rethrowIfRedirect } from "./redirect-error";

describe("redirect-error utility", () => {
  describe("isRedirectError", () => {
    it("should return true for an error thrown by Next.js redirect()", () => {
      try {
        redirect("/dashboard");
      } catch (error) {
        expect(isRedirectError(error)).toBe(true);
      }
    });

    it("should return true for errors with a valid Next.js redirect digest", () => {
      const error = new Error("NEXT_REDIRECT");
      (error as unknown as { digest: string }).digest =
        "NEXT_REDIRECT;replace;/login;307;";
      expect(isRedirectError(error)).toBe(true);
    });

    it("should return true for error objects matching NEXT_REDIRECT message", () => {
      const error = new Error("NEXT_REDIRECT");
      expect(isRedirectError(error)).toBe(true);
    });

    it("should return true for plain objects with NEXT_REDIRECT digest", () => {
      const obj = { digest: "NEXT_REDIRECT;push;/organizations;303;" };
      expect(isRedirectError(obj)).toBe(true);
    });

    it("should return false for regular Error instances", () => {
      const error = new Error("Something went wrong");
      expect(isRedirectError(error)).toBe(false);
    });

    it("should return false for errors with other Next.js digests like NEXT_NOT_FOUND", () => {
      const error = new Error("NEXT_NOT_FOUND");
      (error as unknown as { digest: string }).digest = "NEXT_NOT_FOUND";
      expect(isRedirectError(error)).toBe(false);
    });

    it("should return false for non-error types", () => {
      expect(isRedirectError(null)).toBe(false);
      expect(isRedirectError(undefined)).toBe(false);
      expect(isRedirectError("error string")).toBe(false);
      expect(isRedirectError(12345)).toBe(false);
      expect(isRedirectError({})).toBe(false);
    });
  });

  describe("rethrowIfRedirect", () => {
    it("should re-throw if the error is a redirect error", () => {
      expect(() => {
        try {
          redirect("/organizations");
        } catch (error) {
          rethrowIfRedirect(error);
        }
      }).toThrow();
    });

    it("should not throw if the error is not a redirect error", () => {
      expect(() => {
        rethrowIfRedirect(new Error("Database connection failed"));
      }).not.toThrow();

      expect(() => {
        rethrowIfRedirect(null);
      }).not.toThrow();
    });
  });
});
