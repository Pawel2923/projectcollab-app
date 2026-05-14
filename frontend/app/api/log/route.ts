import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AppError } from "@/services/error/app-error";
import { logError } from "@/services/error/error-logger";
import { logToServer } from "@/services/log/server-logger";
import { isOk } from "@/utils/result";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const result = await logToServer(body);
    if (isOk(result)) {
      return new NextResponse(null, { status: 204 });
    }

    if (result.error instanceof AppError) {
      logError(result.error);
      return NextResponse.json(result.error, { status: result.error.status });
    }

    return NextResponse.json(createAndLogUnknownAppError(), { status: 500 });
  } catch (error) {
    return NextResponse.json(createAndLogUnknownAppError(error), { status: 500 });
  }
}

function createAndLogUnknownAppError(error?: unknown): AppError {
    const appError = new AppError({
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred while processing the log entry.",
      status: 500,
      severity: "error",
      context: "Error in POST /api/log",
      originalError: error,
    });
    logError(appError);

    return appError;
}
