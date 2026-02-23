"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import { getServerApiUrl } from "@/utils/server-api-url";

const schema = z.object({
  issueIri: z.string().min(1, "Issue IRI is required"),
  sprintIri: z.string().min(1, "Sprint IRI is required"),
  organizationId: z.string(),
  projectId: z.string(),
});

export default async function addIssueToSprint(
  _initialState: unknown,
  formData: FormData | z.infer<typeof schema>,
): Promise<ActionResult<void>> {
  const data =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

  const validatedFields = schema.safeParse(data);

  if (!validatedFields.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      status: 400,
      errors: z.treeifyError(validatedFields.error),
    };
  }

  const { issueIri, sprintIri, organizationId, projectId } =
    validatedFields.data;

  const apiUrl = getServerApiUrl();
  if (!apiUrl) {
    return {
      ok: false,
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
      message: "API URL is not configured",
    };
  }

  const token = await getAccessToken(apiUrl);
  if (!token) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      status: 401,
      message: "You must be logged in to perform this action",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/issue_sprints`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/ld+json",
      },
      body: JSON.stringify({
        issue: issueIri,
        sprint: sprintIri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        { status: response.status, ...errorData },
        "Failed to add issue to sprint",
      );
    }

    revalidatePath(
      `/organizations/${organizationId}/projects/${projectId}/issues`,
    );
    revalidatePath(
      `/organizations/${organizationId}/projects/${projectId}/sprints`,
    );

    return { ok: true };
  } catch (error) {
    return handleApiError(error, "Failed to add issue to sprint");
  }
}
