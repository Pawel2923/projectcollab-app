import { notFound, redirect } from "next/navigation";
import React from "react";

import { IssueDetails } from "@/components/IssueDetails/IssueDetails";
import type { SelectOption } from "@/components/IssueDetails/types";
import { apiGet } from "@/lib/utils/apiClient";
import { extractIdFromIri } from "@/lib/utils/iri";
import { getAccessTokenReadOnly } from "@/services/auth/token-read-service";

type Resolution = {
  "@id"?: string;
  id?: number;
  value?: string;
};

import type { Metadata } from "next";

import type { Collection } from "@/types/api/collection";
import type {
  IssueDetails as IssueDetailsType,
  IssueStatus,
  IssueType,
} from "@/types/api/issue";
import type { IssueComment } from "@/types/api/issue-metadata";
import type { ProjectMember } from "@/types/api/project";
import type { Sprint } from "@/types/api/sprint";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; projectId: string; issueId: string }>;
}): Promise<Metadata> {
  const { issueId } = await params;
  const token = await getAccessTokenReadOnly();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!token || !apiUrl) {
    return {
      title: "Szczegóły zadania",
    };
  }

  const issueResponse = await fetchWithAuth<IssueDetailsType>(
    `${apiUrl}/issues/${issueId}`,
    token,
  );

  if (!issueResponse.ok || !issueResponse.data) {
    return {
      title: "Szczegóły zadania",
    };
  }

  const issue = issueResponse.data;
  return {
    title: `${issue.key} ${issue.title}`,
  };
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ id: string; projectId: string; issueId: string }>;
}) {
  const { id: organizationId, projectId, issueId } = await params;

  const token = await getAccessTokenReadOnly();
  if (!token) {
    redirect("/signin");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("Brak konfiguracji adresu API");
  }

  const issueResponse = await fetchWithAuth<IssueDetailsType>(
    `${apiUrl}/issues/${issueId}`,
    token,
  );

  if (!issueResponse.ok) {
    if (issueResponse.status === 404) {
      notFound();
    }

    if (issueResponse.status === 401) {
      redirect("/signin");
    }

    throw new Error(
      `Nie udało się pobrać szczegółów zadania (${issueResponse.status}).`,
    );
  }

  const issue = issueResponse.data;

  // Fetch statuses, types, and resolutions
  const statusesResponse = await fetchWithAuth<Collection<IssueStatus>>(
    `${apiUrl}/issue_statuses`,
    token,
  );
  const typesResponse = await fetchWithAuth<Collection<IssueType>>(
    `${apiUrl}/issue_types`,
    token,
  );
  const resolutionsResponse = await fetchWithAuth<Collection<Resolution>>(
    `${apiUrl}/resolutions`,
    token,
  );
  const commentsResponse = await fetchWithAuth<Collection<IssueComment>>(
    `${apiUrl}/comments?issueId=${issueId}`,
    token,
  );
  const sprintsResponse = await fetchWithAuth<Collection<Sprint>>(
    `${apiUrl}/sprints?projectId=${projectId}&status[]=created&status[]=started`,
    token,
  );

  const statusOptions = statusesResponse.ok
    ? buildSelectOptions(statusesResponse.data.member ?? [], "issue_statuses")
    : [];
  const typeOptions = typesResponse.ok
    ? buildSelectOptions(typesResponse.data.member ?? [], "issue_types")
    : [];
  const resolutionOptions = resolutionsResponse.ok
    ? buildSelectOptions(resolutionsResponse.data.member ?? [], "resolutions")
    : [];
  const commentList = commentsResponse.ok ? commentsResponse.data : undefined;
  const sprints = sprintsResponse.ok ? (sprintsResponse.data.member ?? []) : [];

  const projectMembers = await fetchProjectMembers(projectId);

  return (
    <IssueDetails
      organizationId={organizationId}
      projectId={projectId}
      issue={issue}
      statusOptions={statusOptions}
      typeOptions={typeOptions}
      resolutionOptions={resolutionOptions}
      comments={commentList}
      projectMembers={projectMembers}
      sprints={sprints}
    />
  );
}

type FetchResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; data?: unknown };

async function fetchWithAuth<T>(
  url: string,
  token: string,
  init: RequestInit = {},
): Promise<FetchResult<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/ld+json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return { ok: false, status: response.status };
  }

  const data = (await response.json()) as T;
  return { ok: true, status: response.status, data };
}

function buildSelectOptions(
  items: Array<{ "@id"?: string; id?: number; value?: string }>,
  resource: string,
): SelectOption[] {
  return items
    .map((item) => {
      const id = item.id ? String(item.id) : extractIdFromIri(item["@id"]);
      const iri = item["@id"];
      if (!id || !iri) {
        return undefined;
      }

      return {
        id,
        iri,
        label: item.value ?? `${resource} ${id}`,
      } satisfies SelectOption;
    })
    .filter((option): option is SelectOption => Boolean(option));
}

async function fetchProjectMembers(
  projectId: string,
): Promise<ProjectMember[]> {
  const res = await apiGet<Collection<ProjectMember>>(
    `/project_members/?projectId=${projectId}`,
  );
  if (res.error || !res.data) {
    return [];
  }

  return res.data.member ?? [];
}
