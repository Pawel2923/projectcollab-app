"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAccessToken } from "@/lib/services/accessTokenService";
import { getCurrentUser } from "@/lib/services/userService";
import { handleApiError } from "@/lib/utils/errorHandler";
import type { OrganizationMember } from "@/types/api/organization";

import type { ActionResult } from "./types/ActionResult";

const schema = z.object({
  organizationId: z.string().min(1, "ID organizacji jest wymagane"),
  organizationIri: z.string().min(1, "IRI organizacji jest wymagane"),
  memberIri: z.string().min(1, "Członek jest wymagany"),
});

type InviteOrganizationMemberData = z.infer<typeof schema>;

export default async function inviteOrganizationMember(
  _initialState: unknown,
  formData: InviteOrganizationMemberData,
): Promise<ActionResult<OrganizationMember>> {
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

    const user = await getCurrentUser();
    if (!user.ok) {
      return {
        ok: false,
        code: "UNAUTHORIZED",
        status: 401,
      };
    }

    const requestBody = {
      organization: validated.data.organizationIri,
      member: validated.data.memberIri,
      invitedBy: user.value["@id"],
    };

    const res = await fetch(`${nextApiUrl}/organization_members`, {
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
    revalidatePath(`/organizations/${validated.data.organizationId}/members`);

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Invite Organization Member");
  }
}
