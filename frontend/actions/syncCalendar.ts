"use server";

import { ApiError } from "next/dist/server/api-utils";

import { handleApiError } from "@/lib/utils/errorHandler";
import { getAccessToken } from "@/services/auth/token-service";

import type { ActionResult } from "./types/ActionResult";

interface SyncCalendarParams {
  provider: string;
  issueIds: number[];
}

interface SyncCalendarResponse {
  message: string;
  lastSyncedAt: string;
}

export default async function syncCalendar(
  params: SyncCalendarParams,
): Promise<ActionResult<SyncCalendarResponse>> {
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

  console.log("Syncing calendar with body: ", JSON.stringify(params));

  const response = await fetch(`${nextApiUrl}/calendar/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/ld+json",
      accept: "application/ld+json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    if (response.status === 403) {
      return handleApiError(
        new ApiError(403, "Błąd połączenia z kalendarzem"),
        "Sync calendar",
      );
    }

    return handleApiError(
      new ApiError(response.status, "Błąd połączenia z kalendarzem"),
      "Sync calendar",
    );
  }

  const data = await response.json();

  return {
    ok: true,
    content: data as SyncCalendarResponse,
  };
}
