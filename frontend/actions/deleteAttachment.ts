"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/types/ActionResult";
import { apiCall } from "@/lib/utils/apiClient";
import { handleApiError } from "@/lib/utils/errorHandler";

export async function deleteAttachment(
  attachmentId: string,
  issueId: string,
  organizationId: string,
  projectId: string,
): Promise<ActionResult> {
  try {
    const result = await apiCall(`/attachments/${attachmentId}`, {
      method: "DELETE",
    });

    if (result.error) {
      return handleApiError(new Error(result.error), "Delete attachment");
    }

    revalidatePath(
      `/organizations/${organizationId}/projects/${projectId}/issues/${issueId}`,
    );
    return { ok: true };
  } catch (error) {
    return handleApiError(error, "Delete attachment");
  }
}
