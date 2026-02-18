"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";

const schema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

type Organization = {
  id: string;
  name: string;
};

type CreateOrganizationData =
  | FormData
  | {
      name: string;
    };

export default async function createOrganization(
  _initialState: unknown,
  formData: CreateOrganizationData,
): Promise<ActionResult<Organization>> {
  try {
    const validated = schema.safeParse(
      formData instanceof FormData
        ? {
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

    const res = await fetch(`${nextApiUrl}/organizations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
        Accept: "application/ld+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validated.data),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Create organization failed:", res.status, data);
      return handleApiError(
        { ...data, status: res.status },
        "Create organization",
      );
    }

    revalidatePath("/organizations");

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Create organization");
  }
}
