"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { handleApiError } from "@/lib/utils/errorHandler";
import { getAccessToken } from "@/services/accessTokenService";
import type { Sprint } from "@/types/api/sprint";
import { SprintStatusEnum } from "@/types/api/sprint";

const schema = z.object({
  sprintId: z.string().min(1, "ID sprintu jest wymagane"),
  organizationId: z.string().min(1, "ID organizacji jest wymagane"),
  projectId: z.string().min(1, "ID projektu jest wymagane"),
  status: z.string().min(1, "Status sprintu jest wymagany"),
});

type UpdateSprintStatusData = z.infer<typeof schema> | FormData;

/**
 * Update the status of a sprint using form data or sprint data.
 * @param _initialState
 * @param formData
 */
export default async function updateSprintStatus(
  _initialState: unknown,
  formData: UpdateSprintStatusData,
): Promise<ActionResult<Sprint>> {
  try {
    const validated = schema.safeParse(
      formData instanceof FormData
        ? {
            sprintId: formData.get("sprintId"),
            organizationId: formData.get("organizationId"),
            projectId: formData.get("projectId"),
            status: formData.get("status"),
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

    if (
      validated.data.status !== SprintStatusEnum.CREATED &&
      validated.data.status !== SprintStatusEnum.STARTED &&
      validated.data.status !== SprintStatusEnum.COMPLETED
    ) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        status: 400,
        errors: {
          status: {
            _errors: ["Nieprawidłowy status sprintu."],
          },
        },
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

    const requestBody: Record<string, string> = {
      status: validated.data.status,
    };

    const res = await fetch(
      `${nextApiUrl}/sprints/${validated.data.sprintId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          Authorization: `Bearer ${token}`,
          accept: "application/ld+json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      return {
        ok: false,
        status: res.status,
        code: res.status === 403 ? "FORBIDDEN" : "SERVER_ERROR",
        message: errorData.message || "Nie udało się aktywować sprintu.",
      };
    }

    const updatedSprint: Sprint = await res.json();

    if (!res.ok) {
      console.error("Update sprint failed:", res.status, updatedSprint);
      return handleApiError(updatedSprint, "Update sprint");
    }

    revalidatePath(
      `/organizations/${validated.data.organizationId}/projects/${validated.data.projectId}/sprints`,
    );

    return {
      ok: true,
      content: updatedSprint,
    };
  } catch (error) {
    console.log(error);
    return handleApiError(error, "Update sprint");
  }
}
