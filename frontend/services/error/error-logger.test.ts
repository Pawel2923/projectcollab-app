import { afterEach, describe, expect, test, vi } from "vitest";

import { AppError } from "./app-error";
import { logError } from "./error-logger";

describe("error-logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should log error to stdout in NDJSON format", () => {
    const stdoutWriteSpy = vi
      .spyOn(process.stdout, "write")
      .mockReturnValue(true);
    const error = new AppError({
      message: "Test error",
      code: "UNKNOWN_ERROR",
      status: 500,
      severity: "error",
      context: "Error in test",
      violations: [
        {
          propertyPath: "email",
          message: "email must be valid",
          code: "INVALID_EMAIL",
        },
      ],
    });

    logError(error);

    expect(stdoutWriteSpy).toHaveBeenCalledOnce();
    const callArg = stdoutWriteSpy.mock.calls[0][0] as string;
    expect(callArg).toMatch(/^\{.*\}\n$/);

    const parsed = JSON.parse(callArg.trim());
    expect(parsed.message).toBe("Test error");
    expect(parsed.level).toBe("error");
    expect(parsed.serviceName).toBe("frontend");
    expect(parsed.timestamp).toBe(error.timestamp.toISOString());
    expect(parsed.errorCode).toBe("UNKNOWN_ERROR");
    expect(parsed.errorStack).toBe(error.stack);
    expect(parsed.context).toEqual({
      code: "UNKNOWN_ERROR",
      status: 500,
      severity: "error",
      context: "Error in test",
      violations: error.violations,
    });
  });

  test("should throw an error if process.stdout.write fails", () => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => {
      throw new Error("Write failed");
    });

    const error = new AppError({
      message: "Test error",
      code: "UNKNOWN_ERROR",
      status: 500,
    });

    expect(() => logError(error)).toThrow("Write failed");
  });

  test("should throw an error if JSON.stringify fails", () => {
    vi.spyOn(JSON, "stringify").mockImplementation(() => {
      throw new Error("Stringify failed");
    });

    const error = new AppError({
      message: "Test error",
      code: "UNKNOWN_ERROR",
      status: 500,
    });

    expect(() => logError(error)).toThrow("Stringify failed");
  });
});
