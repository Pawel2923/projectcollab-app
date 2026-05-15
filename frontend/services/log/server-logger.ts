import "server-only";

import type { LogEntry } from "@/types/log/log-entry";
import type { Result } from "@/utils/result";
import { Err, Ok } from "@/utils/result";

import { AppError } from "../error/app-error";

interface ServerLogEntry extends LogEntry {
  timestamp: string;
}

export async function logToServer(
  logEntryData: LogEntry,
): Promise<Result<null, AppError>> {
  try {
    const finalEntry: ServerLogEntry = {
      level: logEntryData.level,
      message: logEntryData.message,
      serviceName: logEntryData.serviceName || "unknown",
      context: logEntryData.context,
      errorCode: logEntryData.errorCode,
      errorStack: logEntryData.errorStack,
      requestId: logEntryData.requestId,
      userId: logEntryData.userId,
      statusCode: logEntryData.statusCode,
      environment: logEntryData.environment || process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    };
    const ndjson = `${JSON.stringify(finalEntry)}\n`;

    process.stdout.write(ndjson);

    return Ok(null);
  } catch (error) {
    return Err(
      new AppError({
        message: "Failed to write log entry to stdout",
        code: "UNKNOWN_ERROR",
        status: 500,
        severity: "error",
        originalError: error,
      }),
    );
  }
}
