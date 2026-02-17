"use server";

import { revalidatePath as revalidatePathNext } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";

const schema = z.object({
  issueId: z.string(),
  revalidatePath: z.string().optional(),
});

export default async function deleteIssue(
  issueId?: string | number,
  revalidatePath?: string,
): Promise<ActionResult> {
  try {
    const validated = schema.safeParse({
      issueId: issueId?.toString(),
      revalidatePath,
    });

    if (!validated.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        status: 400,
        errors: z.treeifyError(validated.error),
      };
    }

    const nextApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!nextApiUrl) {
      return {
        ok: false,
        code: "SERVER_CONFIG_ERROR",
        status: 500,
      };
    }

    const token = await getAccessToken(nextApiUrl);
    if (!token) {
      return {
        ok: false,
        code: "UNAUTHORIZED",
        status: 401,
      };
    }

    const res = await fetch(`${nextApiUrl}/issues/${validated.data.issueId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
        accept: "application/ld+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isArchived: true }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        ok: false,
        code: errorData.code || "API_ERROR",
        status: res.status,
        message:
          errorData.message ||
          errorData["hydra:description"] ||
          "Nie udało się usunąć zadania",
      };
    }

    if (validated.data.revalidatePath) {
      revalidatePathNext(validated.data.revalidatePath);
    }

    return { ok: true };
  } catch (error) {
    return handleApiError(error);
  }
}
