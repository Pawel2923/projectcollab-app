"use server";

import { z } from "zod";

import type { ActionResult } from "@/actions/types/ActionResult";
import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import { getServerApiUrl } from "@/utils/server-api-url";
import {
  isValidTimeString,
  parseEstimatedTime,
} from "@/services/issue/issue-date-time-service";
import { buildResourceIri } from "@/utils/iri-util";

const NO_RESOLUTION_VALUE = "__none__";

function parseNewTags(formData: FormData): Array<{
  title: string;
  backgroundColor?: string;
  textColor?: string;
}> {
  const titles = formData.getAll("newTags[title]").filter(Boolean) as string[];
  const backgroundColors = formData.getAll(
    "newTags[backgroundColor]",
  ) as string[];
  const textColors = formData.getAll("newTags[textColor]") as string[];

  return titles.map((title, index) => ({
    title,
    backgroundColor: backgroundColors[index] || undefined,
    textColor: textColors[index] || undefined,
  }));
}

const updateIssueSchema = z.object({
  issueId: z.string().min(1, "Identyfikator zadania jest wymagany"),
  title: z.string().min(1, "Tytuł zadania jest wymagany"),
  description: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      return value.trim() === "" ? null : value;
    }),
  priority: z.enum(["low", "medium", "high", "critical"]),
  statusId: z.string().min(1, "Status jest wymagany"),
  typeId: z.string().min(1, "Typ jest wymagany"),
  resolutionId: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || value === NO_RESOLUTION_VALUE) {
        return undefined;
      }

      return value;
    }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimated: z
    .any()
    .optional()
    .transform((value) => {
      if (value === undefined || value === null) return null;
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "") return null;
        if (isValidTimeString(trimmed)) {
          return parseEstimatedTime(trimmed);
        }
        if (/^\d+$/.test(trimmed)) {
          return Number(trimmed);
        }
        return "__INVALID_TIME_FORMAT__";
      }

      return null;
    })
    .refine((value) => value !== "__INVALID_TIME_FORMAT__", {
      message: 'Nieprawidłowy format czasu. Użyj: 1w 2d 3h 4m (np. "3h 30m").',
    })
    .refine(
      (value) =>
        value === null ||
        (typeof value === "number" && !Number.isNaN(value) && value >= 0),
      {
        message: "Szacowany czas musi być liczbą nieujemną",
      },
    ),
  loggedTime: z
    .any()
    .optional()
    .transform((value) => {
      if (value === undefined || value === null) return null;
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "") return null;
        if (isValidTimeString(trimmed)) {
          return parseEstimatedTime(trimmed);
        }
        if (/^\d+$/.test(trimmed)) {
          return Number(trimmed);
        }
        return "__INVALID_TIME_FORMAT__";
      }

      return null;
    })
    .refine((value) => value !== "__INVALID_TIME_FORMAT__", {
      message:
        'Nieprawidłowy format zarejestrowanego czasu. Użyj: 1w 2d 3h 4m (np. "3h 30m").',
    })
    .refine(
      (value) =>
        value === null ||
        (typeof value === "number" && !Number.isNaN(value) && value >= 0),
      {
        message: "Zarejestrowany czas musi być liczbą nieujemną",
      },
    ),
  assignees: z
    .array(z.string())
    .optional()
    .transform((value) => value ?? []),
  parentIssue: z.string().optional(),
  relatedIssues: z.array(z.string()).optional(),
  tags: z.string().optional(),
  newTags: z
    .array(
      z.object({
        title: z.string().min(1),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
      }),
    )
    .optional(),
});

export type UpdateIssueInput =
  | FormData
  | {
      issueId: string;
      title: string;
      description?: string;
      priority: "low" | "medium" | "high" | "critical";
      statusId: string;
      typeId: string;
      resolutionId?: string;
      startDate?: string;
      endDate?: string;
      estimated?: string | number | null;
      loggedTime?: string | number | null;
      assignees?: string[];
      parentIssue?: string;
      relatedIssues?: string[];
      tags?: string;
      newTags?: Array<{
        title: string;
        backgroundColor?: string;
        textColor?: string;
      }>;
    };

type UpdateIssueResponse = ActionResult<Record<string, unknown>>;

export default async function updateIssue(
  _prevState: unknown,
  formData: UpdateIssueInput,
): Promise<UpdateIssueResponse> {
  try {
    const parsed = updateIssueSchema.safeParse(
      formData instanceof FormData
        ? (function () {
            const rawEstimated = formData.get("estimated");
            let estimatedValue: string | undefined;
            if (typeof rawEstimated === "string") {
              const trimmed = rawEstimated.trim();
              if (trimmed === "") {
                estimatedValue = undefined;
              } else if (isValidTimeString(trimmed)) {
                estimatedValue = String(parseEstimatedTime(trimmed));
              } else {
                // keep original to let Zod produce validation error
                estimatedValue = trimmed;
              }
            } else {
              estimatedValue = undefined;
            }

            const rawLogged = formData.get("loggedTime");
            let loggedValue: string | undefined;
            if (typeof rawLogged === "string") {
              const trimmed = rawLogged.trim();
              if (trimmed === "") {
                loggedValue = undefined;
              } else if (isValidTimeString(trimmed)) {
                loggedValue = String(parseEstimatedTime(trimmed));
              } else {
                loggedValue = trimmed;
              }
            } else {
              loggedValue = undefined;
            }

            return {
              issueId: formData.get("issueId"),
              title: formData.get("title"),
              description: formData.get("description"),
              priority: formData.get("priority"),
              statusId: formData.get("statusId"),
              typeId: formData.get("typeId"),
              resolutionId: extractFormDataString(formData.get("resolutionId")),
              startDate: formData.get("startDate"),
              endDate: formData.get("endDate"),
              estimated: estimatedValue,
              loggedTime: loggedValue,
              assignees: formData.getAll("assignees").map(String),
              parentIssue: formData.get("parentIssue") || undefined,
              relatedIssues: formData
                .getAll("relatedIssues")
                .map(String)
                .filter(Boolean),
              tags: formData.get("tags"),
              newTags: parseNewTags(formData),
            };
          })()
        : {
            ...formData,
            estimated:
              typeof formData.estimated === "string"
                ? isValidTimeString(formData.estimated.trim())
                  ? String(parseEstimatedTime(formData.estimated.trim()))
                  : formData.estimated
                : (formData.estimated ?? undefined),
            loggedTime:
              typeof formData.loggedTime === "string"
                ? isValidTimeString(formData.loggedTime.trim())
                  ? String(parseEstimatedTime(formData.loggedTime.trim()))
                  : formData.loggedTime
                : (formData.loggedTime ?? undefined),
          },
    );

    if (!parsed.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        status: 400,
        errors: z.treeifyError(parsed.error),
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

    const {
      issueId,
      title,
      description,
      priority,
      statusId,
      typeId,
      resolutionId,
      startDate,
      endDate,
      estimated,
      loggedTime,
      assignees,
      parentIssue,
      relatedIssues,
      tags,
      newTags,
    } = parsed.data;

    const payload: Record<string, unknown> = {
      title,
      priority,
      status: buildResourceIri("issue_statuses", statusId),
      type: buildResourceIri("issue_types", typeId),
    };

    if (description !== undefined) {
      payload.description = description;
    }

    payload.resolution = resolutionId
      ? buildResourceIri("resolutions", resolutionId)
      : null;

    const normalizedStartDate = normalizeDateValue(startDate);
    if (normalizedStartDate !== undefined) {
      payload.startDate = normalizedStartDate;
    }

    const normalizedEndDate = normalizeDateValue(endDate);
    if (normalizedEndDate !== undefined) {
      payload.endDate = normalizedEndDate;
    }

    if (estimated !== undefined) {
      payload.estimated = estimated;
    }

    if (loggedTime !== undefined) {
      payload.loggedTime = loggedTime;
    }

    if (Array.isArray(assignees)) {
      payload.assignees = assignees;
    }

    if (parentIssue !== undefined) {
      payload.parentIssue = parentIssue || null;
    }

    if (relatedIssues !== undefined) {
      payload.relatedIssues = relatedIssues;
    }

    // Handle new tags - create them first
    const createdTagIris: string[] = [];
    if (newTags && newTags.length > 0) {
      for (const newTag of newTags) {
        try {
          const tagResponse = await fetch(`${nextApiUrl}/tags`, {
            method: "POST",
            headers: {
              "Content-Type": "application/ld+json",
              Accept: "application/ld+json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: newTag.title,
              backgroundColor: newTag.backgroundColor,
              textColor: newTag.textColor,
              issue: buildResourceIri("issues", issueId),
            }),
            cache: "no-store",
          });

          if (tagResponse.ok) {
            const createdTag = await tagResponse.json();
            createdTagIris.push(createdTag["@id"]);
          }
        } catch (error) {
          console.error("Failed to create new tag:", error);
        }
      }
    }

    if (tags !== undefined || createdTagIris.length > 0) {
      const existingTagIris = tags
        ? tags
            .split(",")
            .filter(Boolean)
            .map((tagId) => buildResourceIri("tags", tagId.trim()))
        : [];

      payload.tags = [...existingTagIris, ...createdTagIris];
    }
    const response = await fetch(`${nextApiUrl}/issues/${issueId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
        Accept: "application/ld+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return handleApiError(data, "Update issue");
    }

    return {
      ok: true,
      content: data,
    };
  } catch (error) {
    return handleApiError(error, "Update issue");
  }
}

function normalizeDateValue(value?: string | null): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function extractFormDataString(
  value: FormDataEntryValue | null,
): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  return undefined;
}
