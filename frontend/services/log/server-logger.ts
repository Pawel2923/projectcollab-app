import "server-only";

import { z } from "zod";

import type { LogEntry } from "@/types/log/log-entry";
import type { Result } from "@/utils/result";
import { Err, Ok } from "@/utils/result";

import { AppError } from "../error/app-error";
import { logError } from "../error/error-logger";

interface ServerLogEntry extends LogEntry {
  timestamp: string;
}

const logEntrySchema = z.object({
  level: z.enum(["info", "warn", "debug", "error"]),
  message: z.string().min(1, "Message is required"),
  serviceName: z.string().optional(),
  context: z.object().optional(),
  errorCode: z.string().optional(),
  errorStack: z.string().optional(),
  requestId: z.string().optional(),
  userId: z.string().optional(),
  statusCode: z.number().int().optional(),
  environment: z.enum(["development", "production", "test"]).optional(),
}) satisfies z.ZodType<LogEntry>;

export async function validateAndLog(
  body: unknown,
): Promise<Result<null, AppError>> {
  const logEntryParseResult = logEntrySchema.safeParse(body);
  if (!logEntryParseResult.success) {
    const validationError = new AppError({
      code: "VALIDATION_ERROR",
      message: "Invalid log entry format",
      status: 400,
      severity: "warning",
      context: "Error in POST /api/log",
      originalError: z.treeifyError(logEntryParseResult.error),
    });

    logError(validationError);
    return Err(validationError);
  }

  return await logToServer(logEntryParseResult.data);
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
      environment:
        logEntryData.environment || process.env.NODE_ENV || "development",
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
