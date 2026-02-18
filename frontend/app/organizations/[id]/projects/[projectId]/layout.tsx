import { cookies } from "next/headers";
import React from "react";

import { ServerSideNav } from "@/components/ServerSideNav";
import { TopNav } from "@/components/TopNav";
import { apiGet, rethrowIfRedirect } from "@/services/fetch/api-service";
import { IssuesOptionsProvider } from "@/store/IssuesOptionsContext";
import type { Project } from "@/types/api/project";
import { generateAcronym } from "@/utils/acronym-generator";

export default async function ProjectsLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string; projectId: string }>;
}>) {
  const { id: organizationId, projectId } = await params;
  const cookieStore = await cookies();
  const isSideNavExpanded = cookieStore.get("pc_side_nav_expanded");

  let isSideNavExpandedValue: boolean;
  try {
    isSideNavExpandedValue = JSON.parse(isSideNavExpanded?.value || "true");
  } catch {
    isSideNavExpandedValue = true;
  }

  // Fetch project info server-side
  let headerTitle: string | undefined;
  let headerAcronym: string | undefined;

  try {
    const projectResponse = await apiGet<Project>(`/projects/${projectId}`);
    if (projectResponse.data) {
      const project = projectResponse.data;
      headerTitle = project.name;
      headerAcronym = generateAcronym(project.name);
    }
  } catch (error) {
    await rethrowIfRedirect(error);
    console.error("Failed to fetch project info:", error);
    // Continue with undefined values - component will use defaults
  }

  return (
    <div className="grid grid-rows-[auto_auto_1fr] md:grid-rows-[auto_1fr] grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
      <TopNav projectId={projectId} organizationId={organizationId} />
      <ServerSideNav
        contentId={projectId}
        contentType="project"
        isSideNavExpanded={isSideNavExpandedValue}
        organizationId={organizationId}
        headerTitle={headerTitle}
        headerAcronym={headerAcronym}
      />
      <main className="flex flex-col col-start-1 row-start-3 p-4 gap-6 overflow-y-auto bg-light md:col-start-2 md:row-start-2">
        <IssuesOptionsProvider>{children}</IssuesOptionsProvider>
      </main>
    </div>
  );
}
