"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import type { ChatMember } from "@/types/api/chat";

import type { ActionResult } from "../types/ActionResult";

const schema = z.object({
  chatId: z.string().min(1, "ID czatu jest wymagane"),
  chatIri: z.string().min(1, "IRI czatu jest wymagane"),
  memberIri: z.string().min(1, "Członek jest wymagany"),
  organizationId: z.string().min(1, "ID organizacji jest wymagane"),
});

type InviteChatMemberData = z.infer<typeof schema>;

export default async function inviteChatMember(
  _initialState: unknown,
  formData: InviteChatMemberData,
): Promise<ActionResult<ChatMember>> {
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

    const requestBody = {
      chat: validated.data.chatIri,
      member: validated.data.memberIri,
    };

    const res = await fetch(`${nextApiUrl}/chat_members`, {
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

    revalidatePath(
      `/organizations/${validated.data.organizationId}/chats/${validated.data.chatId}`,
    );

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Invite Chat Member");
  }
}
