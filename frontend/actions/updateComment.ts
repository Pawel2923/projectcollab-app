"use server";

import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/lib/services/accessTokenService";
import type { Comment } from "@/lib/types/api";
import { handleApiError } from "@/lib/utils/errorHandler";

const schema = z.object({
  commentIri: z.string().min(1, "ID zadania jest wymagane"),
  content: z.string().min(1, "Wpisz treść komentarza"),
});

type CreateCommentData =
  | FormData
  | {
      commentIri: string;
      content: string;
    };

/**
 * Create a new comment using form data or comment data.
 * @param _initialState
 * @param formData
 */
export default async function createComment(
  _initialState: unknown,
  formData: CreateCommentData,
): Promise<ActionResult<Comment>> {
  try {
    const validated = schema.safeParse(
      formData instanceof FormData
        ? {
            commentIri: formData.get("commentIri"),
            content: formData.get("content"),
          }
        : formData,
    );

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

    const requestBody: Record<string, unknown> = {
      content: validated.data.content,
    };

    const res = await fetch(`${nextApiUrl}${validated.data.commentIri}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
        Authorization: `Bearer ${token}`,
        accept: "application/ld+json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Update comment failed:", res.status, data);
      return handleApiError(data, "Update comment");
    }

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Update comment");
  }
}
