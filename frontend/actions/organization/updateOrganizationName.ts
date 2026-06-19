"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getOrRefreshAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import type { Organization } from "@/types/api/organization";
import { getApiUrl } from "@/utils/get-api-url";

const schema = z.object({
  organizationId: z.string().min(1, "ID organizacji jest wymagane"),
  name: z
    .string()
    .min(2, "Nazwa organizacji musi mieć od 2 do 50 znaków")
    .max(50, "Nazwa organizacji musi mieć od 2 do 50 znaków"),
});

type UpdateOrganizationNameData =
  | FormData
  | {
      organizationId: string;
      name: string;
    };

export default async function updateOrganizationName(
  _prevState: unknown,
  formData: UpdateOrganizationNameData,
): Promise<ActionResult<Organization>> {
  try {
    const validated = schema.safeParse(
      formData instanceof FormData
        ? {
            organizationId: formData.get("organizationId"),
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
      `${nextApiUrl}/organizations/${validated.data.organizationId}`,
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
        "Update organization name",
      );
    }

    revalidatePath(`/organizations/${validated.data.organizationId}`);
    revalidatePath(`/organizations`);

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Update organization name");
  }
}
