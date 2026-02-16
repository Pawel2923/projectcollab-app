"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { handleApiError } from "@/lib/utils/errorHandler";
import { getAccessToken } from "@/services/auth/token-service";
import type { IssueComment } from "@/types/api/issue-metadata";

const schema = z.object({
  content: z.string().min(1, "Wpisz treść komentarza"),
  issueId: z.string().min(1, "ID zadania jest wymagane"),
});

type CreateCommentData =
  | FormData
  | {
      content: string;
      issueId: string;
    };

/**
 * Create a new comment using form data or comment data.
 * @param _initialState
 * @param formData
 */
export default async function createComment(
  _initialState: unknown,
  formData: CreateCommentData,
): Promise<ActionResult<IssueComment>> {
  try {
    const validated = schema.safeParse(
      formData instanceof FormData
        ? {
            content: formData.get("content"),
            issueId: formData.get("issueId"),
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
      issue: `/issues/${validated.data.issueId}`,
    };

    const res = await fetch(`${nextApiUrl}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${token}`,
        accept: "application/ld+json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Create comment failed:", res.status, data);
      return handleApiError(data, "Create comment");
    }

    revalidatePath("/organizations", "layout");

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Create comment");
  }
}
