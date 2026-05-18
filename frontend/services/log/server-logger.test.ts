import { beforeEach, describe, expect, test, vi } from "vitest";

import type { LogEntry } from "@/types/log/log-entry";
import { match } from "@/utils/result";

import { AppError } from "../error/app-error";
import * as errorLogger from "../error/error-logger";
import { logToServer, validateAndLog } from "./server-logger";

describe("validateAndLog", () => {
  test("should call logToServer with valid log entry and return Ok result", async () => {
    const stdoutWriteSpy = vi
      .spyOn(process.stdout, "write")
      .mockReturnValue(true);

    const logEntry: LogEntry = {
      level: "info",
      message: "Valid message",
      serviceName: "test-service",
    };

    match(await validateAndLog(logEntry), {
      ok: (value) => {
        expect(value).toBeNull();
        expect(stdoutWriteSpy).toHaveBeenCalled();
      },
      err: () => {
        expect.fail("Expected validateAndLog to return Ok result");
      },
    });
  });

  test("should call logError and return Err result when log entry validation fails", async () => {
    const logErrorSpy = vi
      .spyOn(errorLogger, "logError")
      .mockImplementation(() => undefined);

    const invalidBody = { unexpected: true };

    match(await validateAndLog(invalidBody), {
      ok: () => {
        expect.fail("Expected validateAndLog to return Err result");
      },
      err: (error) => {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe("VALIDATION_ERROR");
        expect(logErrorSpy).toHaveBeenCalled();
      },
    });
  });

  test("should return Err result with AppError if logToServer returns an error", async () => {
    const logErrorSpy = vi
      .spyOn(errorLogger, "logError")
      .mockImplementation(() => undefined);

    vi.spyOn(process.stdout, "write").mockImplementation(() => {
      throw new Error("Write failed");
    });

    const logEntry: LogEntry = {
      level: "error",
      message: "Will fail to write",
      serviceName: "test-service",
    };

    match(await validateAndLog(logEntry), {
      ok: () => {
        expect.fail("Expected validateAndLog to return Err result");
      },
      err: (error) => {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe("Failed to write log entry to stdout");
        expect(error.code).toBe("UNKNOWN_ERROR");
        expect(logErrorSpy).toHaveBeenCalled();
      },
    });
  });
});

describe("logToServer", () => {
  let stdoutWriteSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutWriteSpy = vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  test("should write log entry to stdout in NDJSON format", async () => {
    const logEntry: LogEntry = {
      level: "info",
      message: "Test message",
      serviceName: "test-service",
      context: { userId: "123" },
      errorCode: undefined,
      errorStack: undefined,
      requestId: "req-123",
      userId: "user-123",
      statusCode: 200,
      environment: "test",
    };

    await logToServer(logEntry);

    expect(stdoutWriteSpy).toHaveBeenCalledOnce();
    const callArg = stdoutWriteSpy.mock.calls[0][0] as string;
    expect(callArg).toMatch(/^\{.*\}\n$/);

    const parsed = JSON.parse(callArg.trim());
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("Test message");
    expect(parsed.serviceName).toBe("test-service");
    expect(parsed.timestamp).toBeDefined();
  });

  test("should return Result with null on successful log write", async () => {
    const logEntry: LogEntry = {
      level: "error",
      message: "Error message",
      serviceName: "test-service",
    };

    match(await logToServer(logEntry), {
      ok: (value) => {
        expect(value).toBeNull();
      },
      err: () => {
        expect.fail("Expected logToServer to return Ok result");
      },
    });
  });

  test("should return Result with AppError if writing to stdout fails", async () => {
    const logErrorSpy = vi
      .spyOn(errorLogger, "logError")
      .mockImplementation(() => undefined);

    stdoutWriteSpy.mockImplementationOnce(() => {
      throw new Error("Write failed");
    });

    const logEntry: LogEntry = {
      level: "warn",
      message: "Warning message",
      serviceName: "test-service",
    };

    match(await logToServer(logEntry), {
      ok: () => {
        expect.fail("Expected logToServer to return Err result");
      },
      err: (error) => {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe("Failed to write log entry to stdout");
        expect(error.code).toBe("UNKNOWN_ERROR");
        expect(logErrorSpy).toHaveBeenCalled();
      },
    });
  });
});
