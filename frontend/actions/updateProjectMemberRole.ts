"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { handleApiError } from "@/lib/utils/errorHandler";
import { getAccessToken } from "@/services/accessTokenService";
import type { ProjectMember } from "@/types/api/project";

import type { ActionResult } from "./types/ActionResult";

const schema = z.object({
  memberId: z.string().min(1, "Member ID jest wymagane"),
  roleIri: z.string().min(1, "Rola jest wymagana"),
  projectId: z.string().min(1, "ID projektu jest wymagane"),
  organizationId: z.string().min(1, "ID organizacji jest wymagane"),
});

type UpdateProjectMemberRoleData = z.infer<typeof schema>;

/**
 * Update a project member's role
 */
export default async function updateProjectMemberRole(
  _initialState: unknown,
  formData: UpdateProjectMemberRoleData,
): Promise<ActionResult<ProjectMember>> {
  const validatedFields = schema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      errors: z.treeifyError(validatedFields.error),
    };
  }

  const { memberId, roleIri, projectId, organizationId } = validatedFields.data;

  try {
    const token = await getAccessToken(process.env.NEXT_PUBLIC_API_URL || "");

    if (!token) {
      return {
        ok: false,
        status: 401,
        code: "UNAUTHORIZED",
        message: "Wymagane uwierzytelnienie",
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/project_members/${memberId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          Accept: "application/ld+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: roleIri,
        }),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      return {
        ok: false,
        status: response.status,
        code: response.status === 403 ? "FORBIDDEN" : "SERVER_ERROR",
        message:
          errorData.message || "Nie udało się zaktualizować roli członka",
      };
    }

    const updatedMember: ProjectMember = await response.json();

    // Revalidate relevant pages
    revalidatePath(`/organizations/${organizationId}/projects/${projectId}`);
    revalidatePath(
      `/organizations/${organizationId}/projects/${projectId}/permissions`,
    );

    return {
      ok: true,
      content: updatedMember,
    };
  } catch (error) {
    return handleApiError(error, "Aktualizacja roli członka");
  }
}
