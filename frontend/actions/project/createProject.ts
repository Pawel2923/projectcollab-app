"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import { getServerApiUrl } from "@/utils/server-api-url";

const schema = z.object({
  name: z.string().min(1, "Project name is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

type Project = {
  id: string;
  name: string;
};

type CreateProjectData =
  | FormData
  | {
      name: string;
      organizationId: string;
    };

export default async function createProject(
  _initialState: unknown,
  formData: CreateProjectData,
): Promise<ActionResult<Project>> {
  try {
    const validated = schema.safeParse(
      formData instanceof FormData
        ? {
            name: formData.get("name"),
            organizationId: formData.get("organizationId"),
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

      const nextApiUrl = getServerApiUrl();
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

    const res = await fetch(`${nextApiUrl}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${token}`,
        accept: "application/ld+json",
      },
      body: JSON.stringify({
        name: validated.data.name,
        organization: `/organizations/${validated.data.organizationId}`,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Create project failed:", res.status, data);
      return handleApiError({ ...data, status: res.status }, "Create project");
    }

    revalidatePath(`/organizations/${validated.data.organizationId}`);

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Create project");
  }
}
