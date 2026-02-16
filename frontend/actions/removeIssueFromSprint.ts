"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { handleApiError } from "@/lib/utils/errorHandler";
import { getAccessToken } from "@/services/accessTokenService";

const schema = z.object({
  issueSprintIri: z.string().min(1, "IssueSprint IRI is required"),
  organizationId: z.string(),
  projectId: z.string(),
});

export default async function removeIssueFromSprint(
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

  const { issueSprintIri, organizationId, projectId } = validatedFields.data;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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
    const url = issueSprintIri.startsWith("http")
      ? issueSprintIri
      : `${apiUrl}${issueSprintIri}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        { status: response.status, ...errorData },
        "Failed to remove issue from sprint",
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
    return handleApiError(error, "Failed to remove issue from sprint");
  }
}
