import type { Metadata } from "next";
import React from "react";

import { ActiveFilters } from "@/components/Issue/ActiveFilters";
import { Filter } from "@/components/Issue/Filter";
import { Sort } from "@/components/Issue/Sort";
import { ListIssues } from "@/components/List/ListIssues";
import { PageHeader } from "@/components/PageHeader";
import { ErrorBoundary } from "@/error/ErrorBoundary";
import { apiGet } from "@/lib/utils/apiClient";
import { IssuesOptionsProvider } from "@/store/IssuesOptionsContext";
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
    title: `Lista zadań${projectName}`,
  };
}

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <IssuesOptionsProvider>
      <PageHeader title="Lista zadań" />
      <section className="space-y-6 bg-background p-4 rounded-lg border border-border">
        <div className="flex items-start gap-3">
          <Filter projectId={projectId} />
          <Sort />
          <ActiveFilters />
        </div>
        <div className="grid">
          <ErrorBoundary>
            <ListIssues projectId={projectId} />
          </ErrorBoundary>
        </div>
      </section>
    </IssuesOptionsProvider>
  );
}
