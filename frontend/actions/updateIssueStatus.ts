"use server";

import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/lib/services/accessTokenService";
import { handleApiError } from "@/lib/utils/errorHandler";
import { buildResourceIri } from "@/lib/utils/iri";

const updateIssueStatusSchema = z.object({
  issueId: z.string().min(1, "Identyfikator zadania jest wymagany"),
  statusId: z.string().min(1, "Status jest wymagany"),
});

export async function updateIssueStatus(
  issueId: string,
  statusId: string,
): Promise<ActionResult<void>> {
  try {
    const validationResult = updateIssueStatusSchema.safeParse({
      issueId,
      statusId,
    });

    if (!validationResult.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        status: 400,
        errors: z.treeifyError(validationResult.error),
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

    const payload = {
      status: buildResourceIri("issue_statuses", statusId),
    };

    const response = await fetch(`${nextApiUrl}/issues/${issueId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
        accept: "application/ld+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return handleApiError(data, "Update issue status");
    }

    return {
      ok: true,
      content: undefined,
    };
  } catch (error) {
    return handleApiError(error, "Update issue status");
  }
}
