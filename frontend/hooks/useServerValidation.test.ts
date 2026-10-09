import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";

import { useServerValidation } from "./useServerValidation";

describe("useServerValidation", () => {
  const fields = ["email", "password"] as const;
  const serverFieldsMap = { plainPassword: "password" };

  it("initializes with empty errors", () => {
    const { result } = renderHook(() =>
      useServerValidation(fields, null, serverFieldsMap),
    );

    expect(result.current.serverErrors.email).toEqual({
      isInvalid: false,
      message: "",
    });
    expect(result.current.serverErrors.password).toEqual({
      isInvalid: false,
      message: "",
    });
    expect(result.current.serverErrors.form).toEqual({
      isInvalid: false,
      message: "",
    });
  });

  it("handles Zod validation error with treeifyError", () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });
    const parsed = schema.safeParse({ email: "invalid", password: "123" });
    expect(parsed.success).toBe(false);

    if (!parsed.success) {
      const actionState: ActionResult = {
        ok: false,
        code: "VALIDATION_ERROR",
        status: 400,
        errors: z.treeifyError(parsed.error),
      };

      const { result } = renderHook(() =>
        useServerValidation(fields, actionState, serverFieldsMap),
      );

      expect(result.current.serverErrors.email.isInvalid).toBe(true);
      expect(result.current.serverErrors.password.isInvalid).toBe(true);
    }
  });

  it("handles UNAUTHORIZED / login error", () => {
    const actionState: ActionResult = {
      ok: false,
      code: "UNAUTHORIZED",
      status: 401,
      message: "Nieprawidłowy e-mail lub hasło.",
    };

    const { result } = renderHook(() =>
      useServerValidation(fields, actionState, serverFieldsMap),
    );

    expect(result.current.serverErrors.form?.isInvalid).toBe(true);
    expect(result.current.serverErrors.form?.message).toBe(
      "Nieprawidłowy e-mail lub hasło.",
    );
  });

  it("handles API Platform 422 violations", () => {
    const actionState: ActionResult = {
      ok: false,
      code: "VALIDATION_ERROR",
      status: 422,
      violations: [
        {
          propertyPath: "plainPassword",
          message: "This value is too short.",
          code: "",
        },
      ],
    };

    const { result } = renderHook(() =>
      useServerValidation(fields, actionState, serverFieldsMap),
    );

    expect(result.current.serverErrors.password.isInvalid).toBe(true);
  });

  it("handles state transition and clearServerErrors", () => {
    let state: ActionResult | null = null;
    const { result, rerender } = renderHook(() =>
      useServerValidation(fields, state, serverFieldsMap),
    );

    expect(result.current.serverErrors.email.isInvalid).toBe(false);

    // Simulate server action returning error
    state = {
      ok: false,
      code: "UNAUTHORIZED",
      status: 401,
      message: "Błędne dane",
    };
    rerender();

    expect(result.current.serverErrors.form?.isInvalid).toBe(true);
    expect(result.current.serverErrors.form?.message).toBe("Błędne dane");

    // Clear server errors
    act(() => {
      result.current.clearServerErrors();
    });

    expect(result.current.serverErrors.form?.isInvalid).toBe(false);

    // Another error arrives
    state = {
      ok: false,
      code: "SERVER_CONFIG_ERROR",
      status: 500,
    };
    rerender();

    expect(result.current.serverErrors.form?.isInvalid).toBe(true);
  });

  it("handles root-level Zod error", () => {
    const actionState: ActionResult = {
      ok: false,
      code: "VALIDATION_ERROR",
      status: 400,
      errors: {
        errors: ["Niepoprawny formularz"],
        properties: {},
      },
    };

    const { result } = renderHook(() =>
      useServerValidation(fields, actionState, serverFieldsMap),
    );

    expect(result.current.serverErrors.form?.isInvalid).toBe(true);
    expect(result.current.serverErrors.form?.message).toBe(
      "Niepoprawny formularz",
    );
  });
});
