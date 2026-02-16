import { redirect } from "next/navigation";
import React from "react";

import { PageHeader } from "@/components/PageHeader";
import { ProjectsContent } from "@/components/Project/ProjectsContent";
import { apiGet, rethrowIfRedirect } from "@/lib/utils/apiClient";
import { getAccessTokenReadOnly } from "@/services/auth/token-read-service";

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { id: orgId } = await params;
  const urlParams = await searchParams;
  const page = parseInt(urlParams.page || "1", 10);
  const itemsPerPage = 12;

  const token = await getAccessTokenReadOnly();
  if (!token) {
    redirect("/signin");
  }

  let organization = { name: "Unknown Organization" };
  let projects = { totalItems: 0, member: [] };

  try {
    const [orgResp, projectsResp] = await Promise.all([
      apiGet(`/organizations/${orgId}`),
      apiGet(
        `/projects?organizationId%5B%5D=${orgId}&page=${page}&itemsPerPage=${itemsPerPage}`,
      ),
    ]);

    if (!orgResp.error && orgResp.data) {
      organization = orgResp.data as typeof organization;
    } else {
      console.error("Failed to fetch organization:", orgResp.status);
    }

    if (!projectsResp.error && projectsResp.data) {
      projects = projectsResp.data as typeof projects;
    } else {
      console.error("Failed to fetch projects:", projectsResp.status);
    }
  } catch (error) {
    await rethrowIfRedirect(error);
    console.error("Error fetching organization data:", error);
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <PageHeader
          title="Projekty"
          description={`Zarządzaj wszystkimi projektami w organizacji ${organization.name}`}
        />
      </div>

      <ProjectsContent
        projects={projects.member}
        totalItems={projects.totalItems}
        currentPage={page}
        itemsPerPage={itemsPerPage}
        organizationId={orgId}
      />
    </div>
  );
}
