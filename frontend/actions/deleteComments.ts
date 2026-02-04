"use server";

import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/lib/services/accessTokenService";
import { handleApiError } from "@/lib/utils/errorHandler";

const schema = z.object({
  commentIri: z.string().min(1, "ID komentarza jest wymagane"),
});

export default async function deleteComment(
  commentIri: string,
): Promise<ActionResult> {
  try {
    const validated = schema.safeParse({ commentIri });

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

    const res = await fetch(`${nextApiUrl}${validated.data.commentIri}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
        accept: "application/ld+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isArchived: true }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Delete comment failed:", res.status, data);
      return handleApiError(data, "Delete comment");
    }

    return { ok: true };
  } catch (error) {
    return handleApiError(error);
  }
}
