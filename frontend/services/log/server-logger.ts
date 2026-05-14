import "server-only";

import type { Result } from "@/utils/result";
import { Err, isOk, Ok } from "@/utils/result";

import { AppError } from "../error/app-error";

interface LogEntry {
  level: "info" | "warn" | "debug" | "error";
  message: string;
  context?: object;
  timestamp?: Date;
  source?: string;
}

export async function logToServer(
  body: LogEntry | AppError | unknown,
): Promise<Result<null, AppError>> {
  const parseResult = parseBody(body);
  if (!isOk(parseResult)) {
    return Err(parseResult.error);
  }

  const logResult = writeLogEntryToStdout(parseResult.value);
  if (!isOk(logResult)) {
    return Err(logResult.error);
  }

  return Ok(null);
}

function parseBody(body: unknown): Result<LogEntry, AppError> {
  if (body instanceof AppError) {
    return Ok({
      level: "error",
      message: body.message,
      context: body,
      timestamp: body.timestamp || new Date(),
      source: "logToServer",
    });
  } else if (typeof body === "object" && body !== null) {
    return Ok({
      level: "info",
      message: "Log entry",
      context: body,
      timestamp: new Date(),
      source: "logToServer",
    });
  } else {
    return Err(
      new AppError({
        message: "Invalid log entry format",
        code: "VALIDATION_ERROR",
        status: 400,
        severity: "warning",
      }),
    );
  }
}

function writeLogEntryToStdout(entry: LogEntry): Result<null, AppError> {
  try {
    const ndjson = JSON.stringify(entry) + "\n";
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
