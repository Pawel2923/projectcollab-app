"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import { getServerApiUrl } from "@/utils/server-api-url";

const schema = z.object({
  memberId: z.number().positive(),
  role: z.enum(["CREATOR", "ADMIN", "MEMBER"]),
});

export default async function updateOrganizationMemberRole(
  _initialState: unknown,
  data: { memberId: number; role: string },
): Promise<ActionResult> {
  const validation = schema.safeParse(data);

  if (!validation.success) {
    return {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid input data",
      violations: validation.error.issues.map((issue) => ({
        propertyPath: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  const { memberId, role } = validation.data;

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

  // Fetch all organization roles and find the one matching the value
  const rolesResponse = await fetch(
    `${nextApiUrl}/organization_roles?pagination=false`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!rolesResponse.ok) {
    return handleApiError(
      { status: rolesResponse.status },
      "Fetch organization roles",
    );
  }

  const rolesData = await rolesResponse.json();
  const roleData = rolesData.member?.find(
    (r: { value: string }) => r.value === role,
  );

  if (!roleData) {
    return {
      ok: false,
      status: 404,
      code: "NOT_FOUND",
      message: `Role ${role} not found`,
    };
  }

  try {
    const response = await fetch(
      `${nextApiUrl}/organization_members/${memberId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: roleData["@id"],
        }),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return handleApiError(
        { ...data, status: response.status },
        "Update organization member role",
      );
    }

    // Extract organization ID from member's organization IRI
    const orgMatch = data.organization?.match(/\/organizations\/(\d+)/);
    if (orgMatch) {
      revalidatePath(`/organizations/${orgMatch[1]}/members`);
      revalidatePath(`/organizations/${orgMatch[1]}`);
    }

    return { ok: true };
  } catch (error) {
    return handleApiError(error, "Update organization member role");
  }
}
