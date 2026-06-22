"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getOrRefreshAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import type { Project } from "@/types/api/project";
import { getApiUrl } from "@/utils/get-api-url";

const schema = z.object({
  projectId: z.string().min(1, "ID projektu jest wymagane"),
  name: z
    .string()
    .min(2, "Nazwa projektu musi mieć od 2 do 50 znaków")
    .max(50, "Nazwa projektu musi mieć od 2 do 50 znaków"),
});

type UpdateProjectNameData =
  | FormData
  | {
      projectId: string;
      name: string;
    };

export default async function updateProjectName(
  _prevState: unknown,
  formData: UpdateProjectNameData,
): Promise<ActionResult<Project>> {
  try {
    const validated = schema.safeParse(
      formData instanceof FormData
        ? {
            projectId: formData.get("projectId"),
            name: formData.get("name"),
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

    const nextApiUrl = getApiUrl();
    if (!nextApiUrl) {
      return {
        ok: false,
        code: "SERVER_CONFIG_ERROR",
        status: 500,
      };
    }

    const token = await getOrRefreshAccessToken(nextApiUrl);
    if (!token) {
      return {
        ok: false,
        code: "UNAUTHORIZED",
        status: 401,
      };
    }

    const res = await fetch(
      `${nextApiUrl}/projects/${validated.data.projectId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          accept: "application/ld+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: validated.data.name }),
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return handleApiError(
        { ...data, status: res.status },
        "Update project name",
      );
    }

    // Revalidate paths to reflect project name change across the app
    revalidatePath(`/projects`);

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Update project name");
  }
}
