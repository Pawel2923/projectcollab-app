"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";

const schema = z
  .object({
    name: z.string().min(1, "Nazwa sprintu jest wymagana"),
    goal: z.string().optional(),
    startDate: z.string().min(1, "Data rozpoczęcia jest wymagana"),
    endDate: z.string().min(1, "Data zakończenia jest wymagana"),
    projectId: z.string().min(1, "Projekt jest wymagany"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const now = new Date();
      return start >= now;
    },
    {
      message: "Data rozpoczęcia nie może być w przeszłości",
      path: ["startDate"],
    },
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: "Data zakończenia musi być późniejsza niż data rozpoczęcia",
      path: ["endDate"],
    },
  );

type Sprint = {
  id: number;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: string;
  isArchived: boolean;
};

type CreateSprintData =
  | FormData
  | {
      name: string;
      goal?: string;
      startDate: string;
      endDate: string;
      projectId: string;
    };

/**
 * Create a new sprint using form data or sprint data.
 * @param _initialState
 * @param formData
 */
export default async function createSprint(
  _initialState: unknown,
  formData: CreateSprintData,
): Promise<ActionResult<Sprint>> {
  try {
    const validated = schema.safeParse(
      formData instanceof FormData
        ? {
            name: formData.get("name"),
            goal: formData.get("goal") || undefined,
            startDate: formData.get("startDate"),
            endDate: formData.get("endDate"),
            projectId: formData.get("projectId"),
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

    // Convert datetime-local format to ISO 8601 format for API
    const startDateTime = new Date(validated.data.startDate).toISOString();
    const endDateTime = new Date(validated.data.endDate).toISOString();

    // Build the request body with IRIs for relations
    const requestBody: Record<string, unknown> = {
      name: validated.data.name,
      startDate: startDateTime,
      endDate: endDateTime,
      status: "created",
      isArchived: false,
      project: `/projects/${validated.data.projectId}`,
    };

    // Add optional fields
    if (validated.data.goal) {
      requestBody.goal = validated.data.goal;
    }

    const res = await fetch(`${nextApiUrl}/sprints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${token}`,
        accept: "application/ld+json",
      },
      body: JSON.stringify(requestBody),
    });

    // Parse response for both success and error cases
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Create sprint failed:", res.status, data);
      return handleApiError({ ...data, status: res.status }, "Create sprint");
    }

    revalidatePath(`/projects/${validated.data.projectId}`);

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Create sprint");
  }
}
