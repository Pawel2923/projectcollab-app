"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessTokenReadOnly } from "@/services/auth/token-read-service";
import { handleApiError } from "@/services/error/api-error-handler";

export async function uploadAttachment(
  formData: FormData,
): Promise<ActionResult> {
  const file = formData.get("file") as File;
  const issueIri = formData.get("issue") as string;
  const issueId = formData.get("issueId") as string;
  const organizationId = formData.get("organizationId") as string;
  const projectId = formData.get("projectId") as string;

  if (!file || !issueIri) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      status: 400,
      message: "Missing file or issue IRI",
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      status: 400,
      message: "File size exceeds 10MB limit",
    };
  }

  try {
    const token = await getAccessTokenReadOnly();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/attachments`, {
      method: "POST",
      headers: {
        Accept: "application/ld+json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      if (data) {
        return handleApiError(data, "Upload attachment");
      }
      return handleApiError(
        new Error(`Upload failed: ${response.statusText}`),
        "Upload attachment",
      );
    }

    revalidatePath(
      `/organizations/${organizationId}/projects/${projectId}/issues/${issueId}`,
    );
    return { ok: true };
  } catch (error) {
    return handleApiError(error, "Upload attachment");
  }
}
