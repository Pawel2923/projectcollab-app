"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { handleApiError } from "@/lib/utils/errorHandler";
import { getAccessToken } from "@/services/auth/token-service";

import type { ActionResult } from "./types/ActionResult";

const schema = z.object({
  memberId: z.number().positive("ID członka jest wymagane"),
  organizationId: z.string().min(1, "ID organizacji jest wymagane"),
});

type DeleteOrganizationMemberData = z.infer<typeof schema>;

export default async function deleteOrganizationMember(
  _initialState: unknown,
  formData: DeleteOrganizationMemberData,
): Promise<ActionResult<void>> {
  try {
    const validated = schema.safeParse(formData);

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
      `${nextApiUrl}/organization_members/${validated.data.memberId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/ld+json",
        },
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
          "Nie udało się usunąć członka",
      };
    }

    revalidatePath(`/organizations/${validated.data.organizationId}`);
    revalidatePath(`/organizations/${validated.data.organizationId}/members`);

    return {
      ok: true,
      content: undefined,
    };
  } catch (error) {
    return handleApiError(error, "Delete Organization Member");
  }
}
