"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { handleApiError } from "@/lib/utils/errorHandler";
import { getAccessToken } from "@/services/auth/token-service";

const schema = z.object({
  sprintId: z.string(),
  projectId: z.string(),
});

export default async function deleteSprint(
  sprintId: string | number,
  projectId: string | number,
): Promise<ActionResult> {
  try {
    const validated = schema.safeParse({
      sprintId: sprintId.toString(),
      projectId: projectId.toString(),
    });

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

    const res = await fetch(
      `${nextApiUrl}/sprints/${validated.data.sprintId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          accept: "application/ld+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isArchived: true }),
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        ok: false,
        code: errorData.code || "API_ERROR",
        status: res.status,
        message:
          errorData.message ||
          errorData["hydra:description"] ||
          "Nie udało się usunąć sprintu",
      };
    }

    revalidatePath(`/projects/${validated.data.projectId}`);
    revalidatePath(`/projects/${validated.data.projectId}/sprints`);

    return { ok: true };
  } catch (error) {
    return handleApiError(error);
  }
}
