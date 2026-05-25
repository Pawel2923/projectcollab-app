/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test, vi } from "vitest";

import type { LogEntry } from "@/types/log/log-entry";

import { fetchApiLog } from "./fetch-api-log";

describe("fetchApiLog", () => {
  test("should send stringified log entry to the server", () => {
    const logEntry = { level: "error", message: "oops" } as unknown as LogEntry;
    const fetchMock = vi.fn().mockResolvedValue(undefined);
    global.fetch = fetchMock as any;

    fetchApiLog(logEntry);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [
      string,
      Record<string, any>,
    ];
    expect(url).toBe("/api/log");
    expect(options.method).toBe("POST");
    expect(options.headers).toMatchObject({
      "Content-Type": "application/json",
      accept: "application/json",
    });
    expect(options.body).toBe(JSON.stringify(logEntry));
  });

  test("should handle on rejected fetch promise and log warning to console", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network"));
    global.fetch = fetchMock as any;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    fetchApiLog({} as LogEntry);

    await new Promise((r) => setTimeout(r, 0));

    expect(warnSpy).toHaveBeenCalledWith("Failed to log error to server");
  });

  test("should handle exceptions thrown during fetch and log warning to console", () => {
    const syncError = new Error("sync failure");
    global.fetch = (() => {
      throw syncError;
    }) as any;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    fetchApiLog({} as LogEntry);

    expect(warnSpy).toHaveBeenCalled();
    const call = warnSpy.mock.calls[0];
    expect(call[0]).toBe("Failed to log error to server");
    expect(call[1]).toBe(syncError);
  });
});
