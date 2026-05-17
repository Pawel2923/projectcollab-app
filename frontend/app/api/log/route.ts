import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { validateAndLog } from "@/services/log/server-logger";
import { isOk } from "@/utils/result";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const result = await validateAndLog(body);
    if (isOk(result)) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(
      {
        code: result.error.code,
        message: result.error.message,
      },
      { status: result.error.status },
    );
  } catch {
    return NextResponse.json(
      {
        code: "UNKNOWN_ERROR",
        message: "An unknown error occurred while processing the log entry.",
      },
      { status: 500 },
    );
  }
}
