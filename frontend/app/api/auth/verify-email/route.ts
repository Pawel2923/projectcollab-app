import { AppError } from "@/error/app-error";
import { handleApiError } from "@/lib/utils/errorHandler";
import { parseJsonCode } from "@/lib/utils/messageMapper/jsonCodeParser";
import { getAccessToken } from "@/services/accessTokenService";

export async function POST(req: Request): Promise<Response> {
  try {
    const { email } = await req.json();
    if (!email) {
      const error = new AppError({
        message: "Email is required",
        code: "VALIDATION_ERROR",
        status: 400,
        context: "Verify Email",
      });
      return Response.json(error.toJSON(), { status: 400 });
    }

    const nextApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!nextApiUrl) {
      const error = new AppError({
        message: "API URL not configured",
        code: "SERVER_CONFIG_ERROR",
        status: 500,
        context: "Verify Email",
      });
      return Response.json(error.toJSON(), { status: 500 });
    }

    const token = await getAccessToken(nextApiUrl);
    if (!token) {
      const error = new AppError({
        message: "Authentication required",
        code: "UNAUTHORIZED",
        status: 401,
        context: "Verify Email",
      });
      return Response.json(error.toJSON(), { status: 401 });
    }

    const res = await fetch(`${nextApiUrl}/verify-email/send`, {
      method: "POST",
      headers: {
        accepts: "application/ld+json",
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorResult = handleApiError(data, "Verify Email");
      return Response.json(
        {
          code: errorResult.code,
          message: errorResult.message,
          violations: errorResult.violations,
        },
        { status: errorResult.status },
      );
    }

    return Response.json(
      { code: parseJsonCode(data) || "VERIFY_EMAIL_SENT" },
      { status: 202 },
    );
  } catch (error) {
    const errorResult = handleApiError(error, "Verify Email");
    return Response.json(
      {
        code: errorResult.code,
        message: errorResult.message,
        violations: errorResult.violations,
      },
      { status: errorResult.status },
    );
  }
}
