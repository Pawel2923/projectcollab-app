"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/lib/services/accessTokenService";
import { handleApiError } from "@/lib/utils/errorHandler";

const schema = z.object({
  organizationId: z.string(),
});

export default async function deleteOrganization(
  organizationId?: string | number,
): Promise<ActionResult> {
  try {
    const validated = schema.safeParse({
      organizationId: organizationId?.toString(),
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
      `${nextApiUrl}/organizations/${validated.data.organizationId}`,
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
          "Nie udało się usunąć organizacji",
      };
    }

    revalidatePath(`/organizations`);

    return { ok: true };
  } catch (error) {
    return handleApiError(error);
  }
}
