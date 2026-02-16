import type { Metadata } from "next";
import React from "react";

import { ActiveFilters } from "@/components/Issue/ActiveFilters";
import { Filter } from "@/components/Issue/Filter";
import { Sort } from "@/components/Issue/Sort";
import { PageHeader } from "@/components/PageHeader";
import { ColumnSettingsDialog } from "@/components/Table/ColumnSettingsDialog";
import { KanbanIssues } from "@/components/Table/KanbanIssues";
import { ErrorBoundary } from "@/error/ErrorBoundary";
import { apiGet } from "@/lib/utils/apiClient";
import { fetchIssueStatusObjects } from "@/services/issue/issue-status-fetcher";
import { IssuesOptionsProvider } from "@/store/IssuesOptionsContext";
import type { Collection } from "@/types/api/collection";
import type { Issue } from "@/types/api/issue";
import type { Project } from "@/types/api/project";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const project = await apiGet<Project>(`/projects/${projectId}`);
  const projectName = project.data ? ` ${project.data.name}` : "";

  return {
    title: `Tablica Kanban ${projectName}`,
  };
}

export default async function KanbanPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { projectId } = await params;

  // Fetch issue statuses
  const issueStatuses = await fetchIssueStatusObjects(projectId);

  // eslint-disable-next-line prefer-const
  let { data: issues, error } = await apiGet<Collection<Issue>>(
    `/issues?projectId=${projectId}`,
  );

  if (error) {
    console.error("Failed to load issues:", error);
  }

  console.log("Loaded issues:", issues);

  return (
    <IssuesOptionsProvider>
      <PageHeader
        title="Tablica Kanban"
        actions={<ColumnSettingsDialog projectId={projectId} />}
      />
      <section className="space-y-6 bg-background p-4 rounded-lg border border-border">
        <div className="flex items-start gap-3">
          <Filter projectId={projectId} />
          <Sort />
          <ActiveFilters />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          <ErrorBoundary>
            <KanbanIssues
              initialIssues={issues}
              projectId={projectId}
              issueStatuses={issueStatuses}
            />
          </ErrorBoundary>
        </div>
      </section>
    </IssuesOptionsProvider>
  );
}
