import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { AppError } from "@/services/error/app-error";
import { logError } from "@/services/error/error-logger";
import { logToServer } from "@/services/log/server-logger";
import type { LogEntry } from "@/types/log/log-entry";
import { isOk } from "@/utils/result";

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

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
      return NextResponse.json(
        {
          code: validationError.code,
          message: validationError.message,
        },
        { status: validationError.status },
      );
    }

    const result = await logToServer(logEntryParseResult.data);
    if (isOk(result)) {
      return new NextResponse(null, { status: 204 });
    }

    logError(result.error);
    return NextResponse.json(
      {
        code: result.error.code,
        message: result.error.message,
      },
      { status: result.error.status },
    );
  } catch (error) {
    const unknownAppError = new AppError({
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred while processing the log entry.",
      status: 500,
      severity: "error",
      context: "Error in POST /api/log",
      originalError: error,
    });

    logError(unknownAppError);
    return NextResponse.json(
      {
        code: unknownAppError.code,
        message: unknownAppError.message,
      },
      { status: unknownAppError.status },
    );
  }
}
