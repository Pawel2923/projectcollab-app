import type { Metadata } from "next";
import React from "react";

import { PageHeader } from "@/components/PageHeader";
import { AddSprintDialog } from "@/components/Sprint/AddSprintDialog";
import { ProductBacklog } from "@/components/Sprint/ProductBacklog";
import { SprintsList } from "@/components/Sprint/SprintsList";
import { apiGet } from "@/services/fetch/api-service";
import { logToServer } from "@/services/log/server-logger";
import type { Collection } from "@/types/api/collection";
import type { Project } from "@/types/api/project";
import type { Sprint } from "@/types/api/sprint";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const project = await apiGet<Project>(`/projects/${projectId}`);
  const projectName = project.data ? ` ${project.data.name}` : "";

  return {
    title: `Sprinty${projectName}`,
  };
}

export default async function SprintsPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id: organizationId, projectId } = await params;

  const { data: sprints, error } = await apiGet<Collection<Sprint>>(
    `/sprints?project=${projectId}`,
  );

  if (error) {
    const errorStack =
      typeof error === "object" && error !== null && "stack" in error
        ? (error as { stack?: string }).stack
        : undefined;

    await logToServer({
      level: "error",
      message: "Failed to load sprints",
      serviceName: "page.project.sprints",
      context: { error: String(error) },
      errorStack,
    });
  }

  await logToServer({
    level: "debug",
    message: "Loaded sprints",
    serviceName: "page.project.sprints",
    context: { sprints },
  });

  return (
    <>
      <PageHeader
        title="Sprinty"
        actions={<AddSprintDialog projectId={projectId} />}
      />
      <section className="grid gap-4 grid-cols-1">
        <SprintsList
          initialSprints={sprints}
          projectId={projectId}
          organizationId={organizationId}
        />
        <ProductBacklog projectId={projectId} />
      </section>
    </>
  );
}
