"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { handleApiError } from "@/lib/utils/errorHandler";
import { getAccessToken } from "@/services/accessTokenService";
import type { Chat } from "@/types/api/chat";

import type { ActionResult } from "./types/ActionResult";

const baseSchema = z.object({
  organizationId: z.string().min(1, "ID organizacji jest wymagane"),
  type: z.string().min(1, "Typ czatu jest wymagany"),
  projectId: z.string().optional(),
  sprintId: z.string().optional(),
  issueId: z.string().optional(),
});

const memberListSchema = z
  .array(z.email("Nieprawidłowy adres email"))
  .min(1, "Wybierz co najmniej jednego uczestnika");

const groupChatSchema = baseSchema.extend({
  name: z.string().min(1, "Nazwa czatu jest wymagana"),
  members: memberListSchema,
});

const directChatSchema = baseSchema.extend({
  invitedUser: z.email().min(1, "Użytkownik jest wymagany"),
  name: z.string().optional(),
});

export default async function createChat(
  _initialState: unknown,
  formData: CreateChatData,
): Promise<ActionResult<Chat>> {
  try {
    const validated = validateFormData(formData);

    if (!validated || !validated.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        status: 400,
        errors: z.treeifyError(validated?.error || new z.ZodError([])),
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

    const requestBody = getRequestBody(validated.data);

    const res = await fetch(`${nextApiUrl}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${token}`,
        accept: "application/ld+json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json().catch(() => ({}));

    revalidatePath(
      `/organizations/${validated.data.organizationId}/chats/[chatId]`,
      "layout",
    );

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Create Chat");
  }
}

function validateFormData(
  formData: CreateChatData,
): z.ZodSafeParseSuccess<FormFields> | z.ZodSafeParseError<FormFields> {
  if (formData instanceof FormData) {
    const type = formData.get("type");

    if (!type || type === "") {
      return baseSchema.safeParse({
        organizationId: formData.get("organizationId"),
        type: formData.get("type"),
        projectId: formData.get("projectId") || undefined,
        sprintId: formData.get("sprintId") || undefined,
        issueId: formData.get("issueId") || undefined,
      });
    }

    if (type === "direct") {
      return directChatSchema.safeParse({
        organizationId: formData.get("organizationId"),
        type: formData.get("type"),
        invitedUser: formData.get("invitedUser"),
        name: formData.get("name"),
        projectId: formData.get("projectId") || undefined,
        sprintId: formData.get("sprintId") || undefined,
        issueId: formData.get("issueId") || undefined,
      });
    }

    if (type === "group") {
      return groupChatSchema.safeParse({
        organizationId: formData.get("organizationId"),
        type: formData.get("type"),
        name: formData.get("name"),
        members: extractMembers(formData),
        projectId: formData.get("projectId") || undefined,
        sprintId: formData.get("sprintId") || undefined,
        issueId: formData.get("issueId") || undefined,
      });
    }

    return baseSchema.safeParse({
      organizationId: formData.get("organizationId"),
      type: formData.get("type"),
      projectId: formData.get("projectId") || undefined,
      sprintId: formData.get("sprintId") || undefined,
      issueId: formData.get("issueId") || undefined,
    });
  }

  return baseSchema.safeParse(formData);
}

function getRequestBody(data: FormFields): Record<string, unknown> {
  const body: Record<string, unknown> = {
    organization: `/organizations/${data.organizationId}`,
    type: data.type,
  };

  if (data.projectId) {
    body.project = `/projects/${data.projectId}`;
  }

  if (data.sprintId) {
    body.sprint = `/sprints/${data.sprintId}`;
  }

  if (data.issueId) {
    body.issue = `/issues/${data.issueId}`;
  }

  if (data.type === "group" && "name" in data && "members" in data) {
    body.name = data.name;
    body.members = data.members;
  }

  if (data.type === "direct" && "invitedUser" in data) {
    body.members = [data.invitedUser];
    body.name = data.name || "";
  }

  return body;
}

function extractMembers(formData: FormData): string[] {
  const members = formData.getAll("members");
  const normalized = members
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);

  return Array.from(new Set(normalized));
}

type FormFields =
  | z.infer<typeof groupChatSchema>
  | z.infer<typeof directChatSchema>
  | z.infer<typeof baseSchema>;

type CreateChatData = FormData | FormFields;
