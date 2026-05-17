import { afterEach, describe, expect, test, vi } from "vitest";

const { validateAndLogMock, logErrorMock } = vi.hoisted(() => ({
  validateAndLogMock: vi.fn(),
  logErrorMock: vi.fn(),
}));

vi.mock("@/services/error/error-logger", () => ({
  logError: logErrorMock,
}));

vi.mock("@/services/log/server-logger", () => ({
  validateAndLog: validateAndLogMock,
}));

import { POST } from "./route";

describe("/api/log route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should call validateAndLog and return 204 with valid log entry", async () => {
    validateAndLogMock.mockResolvedValueOnce({ ok: true, value: null });

    const request = {
      json: vi.fn().mockResolvedValue({
        level: "info",
        message: "Test log message",
        serviceName: "frontend",
      }),
    };

    const response = await POST(request as never);

    expect(validateAndLogMock).toHaveBeenCalledOnce();
    expect(validateAndLogMock).toHaveBeenCalledWith({
      level: "info",
      message: "Test log message",
      serviceName: "frontend",
    });
    expect(logErrorMock).not.toHaveBeenCalled();
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  test("should return 400 and log validation error when log entry is invalid", async () => {
    validateAndLogMock.mockResolvedValueOnce({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid log entry format",
        status: 400,
      }
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        level: "info",
      }),
    };

    const response = await POST(request as never);

    expect(validateAndLogMock).toHaveBeenCalled();
    expect(logErrorMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      code: "VALIDATION_ERROR",
      message: "Invalid log entry format",
    });
  });

  test("should return error if logToServer returns an error", async () => {
    validateAndLogMock.mockResolvedValueOnce({
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Failed to write log entry to stdout",
        status: 500,
      },
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        level: "warn",
        message: "Something happened",
      }),
    };

    const response = await POST(request as never);

    expect(validateAndLogMock).toHaveBeenCalledOnce();
    expect(logErrorMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      code: "UNKNOWN_ERROR",
      message: "Failed to write log entry to stdout",
    });
  });

  test("should return 500 and log unknown error if an unexpected error occurs", async () => {
    const request = {
      json: vi.fn().mockRejectedValue(new Error("Unexpected failure")),
    };

    const response = await POST(request as never);

    expect(validateAndLogMock).not.toHaveBeenCalled();
    expect(logErrorMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred while processing the log entry.",
    });
  });
});
