"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import { getServerApiUrl } from "@/utils/server-api-url";
import type { ProjectMember } from "@/types/api/project";

import type { ActionResult } from "../types/ActionResult";

const schema = z.object({
  organizationId: z.string().min(1, "ID organizacji jest wymagane"),
  projectId: z.string().min(1, "ID projektu jest wymagane"),
  projectIri: z.string().min(1, "IRI projektu jest wymagane"),
  memberIri: z.string().min(1, "Członek jest wymagany"),
  roleIri: z.string().optional(),
});

type InviteProjectMemberData = z.infer<typeof schema>;

export default async function inviteProjectMember(
  _initialState: unknown,
  formData: InviteProjectMemberData,
): Promise<ActionResult<ProjectMember>> {
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

    const requestBody = {
      project: validated.data.projectIri,
      member: validated.data.memberIri,
      ...(validated.data.roleIri && { role: validated.data.roleIri }),
    };

    const res = await fetch(`${nextApiUrl}/project_members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${token}`,
        accept: "application/ld+json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        ok: false,
        code: errorData.code || "API_ERROR",
        status: res.status,
        message:
          errorData.message ||
          errorData["hydra:description"] ||
          "Nie udało się zaprosić członka",
      };
    }

    const data = await res.json();

    revalidatePath(`/organizations/${validated.data.organizationId}`);
    revalidatePath(
      `/organizations/${validated.data.organizationId}/projects/${validated.data.projectId}`,
    );

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Invite Project Member");
  }
}
