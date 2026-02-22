"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import { getServerApiUrl } from "@/utils/server-api-url";

const schema = z.object({
  title: z.string().min(1, "Issue title is required"),
  description: z.string().optional(),
  priority: z
    .enum(["low", "medium", "high", "critical"])
    .refine((val) => val !== undefined, {
      message: "Priority is required",
    }),
  statusId: z.string().min(1, "Status is required"),
  typeId: z.string().min(1, "Type is required"),
  projectId: z.string().min(1, "Project is required"),
  parentIssue: z.string().optional(),
  relatedIssues: z.array(z.string()).optional(),
});

type Issue = {
  id: string;
  key: string;
  title: string;
  priority: string;
  status: string;
  type: string;
};

type CreateIssueData =
  | FormData
  | {
      title: string;
      description?: string;
      priority: "low" | "medium" | "high" | "critical";
      statusId: string;
      typeId: string;
      projectId: string;
      parentIssue?: string;
      relatedIssues?: string[];
    };

export default async function createIssue(
  _initialState: unknown,
  formData: CreateIssueData,
): Promise<ActionResult<Issue>> {
  try {
    const validated = schema.safeParse(
      formData instanceof FormData
        ? {
            title: formData.get("title"),
            description: formData.get("description") || undefined,
            priority: formData.get("priority"),
            statusId: formData.get("statusId"),
            typeId: formData.get("typeId"),
            projectId: formData.get("projectId"),
            parentIssue: formData.get("parentIssue") || undefined,
            relatedIssues: formData
              .getAll("relatedIssues")
              .map(String)
              .filter(Boolean),
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

    // Build the request body with IRIs for relations
    const requestBody: Record<string, unknown> = {
      title: validated.data.title,
      priority: validated.data.priority,
      status: `/issue_statuses/${validated.data.statusId}`,
      type: `/issue_types/${validated.data.typeId}`,
      project: `/projects/${validated.data.projectId}`,
    };

    // Add optional fields
    if (validated.data.description) {
      requestBody.description = validated.data.description;
    }

    if (validated.data.parentIssue) {
      requestBody.parentIssue = validated.data.parentIssue;
    }

    if (
      validated.data.relatedIssues &&
      validated.data.relatedIssues.length > 0
    ) {
      requestBody.relatedIssues = validated.data.relatedIssues;
    }

    console.log("Issue create request body:", requestBody);

    const res = await fetch(`${nextApiUrl}/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${token}`,
        accept: "application/ld+json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Create issue failed:", res.status, data);
      return handleApiError({ ...data, status: res.status }, "Create issue");
    }

    revalidatePath("/organizations", "layout");

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Create issue");
  }
}
