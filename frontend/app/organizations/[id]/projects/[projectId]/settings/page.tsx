import type { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

import getEntityRole from "@/actions/permissions/getEntityRole";
import { PageHeader } from "@/components/PageHeader";
import ProjectSettingsContent from "@/components/Project/ProjectSettingsContent";
import { getCurrentUser } from "@/services/auth/user-service";
import { apiGet } from "@/services/fetch/api-service";
import type { Collection } from "@/types/api/collection";
import type { Project, ProjectMember } from "@/types/api/project";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const project = await apiGet<Project>(`/projects/${projectId}`);
  const projectName = project.data ? ` ${project.data.name}` : "";

  return {
    title: `Ustawienia${projectName}`,
  };
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id: organizationId, projectId } = await params;
  const userResult = await getCurrentUser();

  if (!userResult.ok || !userResult.value) {
    redirect("/signin");
  }

  const user = userResult.value;

  const userRoleResult = await getEntityRole("project", projectId);
  const userRole =
    userRoleResult.ok && "content" in userRoleResult
      ? userRoleResult.content
      : null;

  if (
    !userRole ||
    !["CREATOR", "ADMIN", "PRODUCT_OWNER", "SCRUM_MASTER"].includes(userRole)
  ) {
    redirect(`/organizations/${organizationId}/projects/${projectId}/summary`);
  }

  const [projectResult, membersResult] = await Promise.all([
    apiGet<Project>(`/projects/${projectId}`),
    apiGet<Collection<ProjectMember>>(
      `/project_members?projectId=${projectId}&pagination=false`,
    ),
  ]);

  if (projectResult.error || !projectResult.data) {
    return (
      <div className="p-4">
        <p className="text-destructive">Nie udało się załadować projektu</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Ustawienia projektu" />
      <ProjectSettingsContent
        project={projectResult.data}
        initialMembers={membersResult.data?.member || []}
        currentUserId={user.id.toString()}
        organizationId={organizationId}
        projectId={projectId}
      />
    </>
  );
}
