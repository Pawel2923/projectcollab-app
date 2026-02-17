import type { Metadata } from "next";
import React from "react";

import { PageHeader } from "@/components/PageHeader";
import { SummaryTabs } from "@/components/Project/Summary/SummaryTabs";
import { apiGet } from "@/services/fetch/api-service";
import type { Collection } from "@/types/api/collection";
import type { Issue, IssueStatus } from "@/types/api/issue";
import type { Project } from "@/types/api/project";
import type { Sprint } from "@/types/api/sprint";
import type { UserOAuthProviders } from "@/types/api/user";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;

  const project = await apiGet<Project>(`/projects/${projectId}`);
  const projectName = project.data ? ` ${project.data.name}` : "";

  return {
    title: `Podsumowanie${projectName} - ProjectCollab`,
  };
}

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { projectId } = await params;

  const [issuesResponse, sprintsResponse, statusesResponse, oAuthResponse] =
    await Promise.all([
      apiGet<Collection<Issue>>(`/issues?projectId=${projectId}`),
      apiGet<Collection<Sprint>>(`/sprints?project=${projectId}`),
      apiGet<Collection<IssueStatus>>(`/issue_statuses?project=${projectId}`),
      apiGet<UserOAuthProviders>(`/users/me/oauth`),
    ]);

  const issues = issuesResponse.data?.member ?? [];
  const sprints = sprintsResponse.data?.member ?? [];
  const statuses = statusesResponse.data?.member ?? [];
  const now = new Date().getTime();
  const oAuthProviders = oAuthResponse.data?.providers ?? [];
  const lastSyncedAtRaw = oAuthResponse.data?.lastSyncedAt;
  const lastSyncedAt = lastSyncedAtRaw
    ? new Date(lastSyncedAtRaw).toISOString()
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader title="Podsumowanie" />
      <SummaryTabs
        issues={issues}
        sprints={sprints}
        statuses={statuses}
        now={now}
        oAuthProviders={oAuthProviders}
        lastSyncedAt={lastSyncedAt}
      />
    </main>
  );
}
