import { redirect } from "next/navigation";
import React from "react";

import { OrganizationSummary } from "@/components/Organization/OrganizationSummary";
import { PageHeader } from "@/components/PageHeader";
import { apiGet, rethrowIfRedirect } from "@/lib/utils/apiClient";
import { getAccessTokenReadOnly } from "@/services/auth/token-read-service";
import type { Chat } from "@/types/api/chat";
import type { Organization } from "@/types/api/organization";
import type { Project } from "@/types/api/project";

export default async function OrganizationOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orgId } = await params;

  const token = await getAccessTokenReadOnly();
  if (!token) {
    redirect("/signin");
  }

  let organization: Organization = {
    "@id": "",
    "@type": "Organization",
    id: 0,
    name: "Unknown Organization",
  };
  let recentProjects: Project[] = [];
  let recentChats: Chat[] = [];
  let totalProjects = 0;
  let totalMembers = 0;

  try {
    const [orgResp, projectsResp, membersResp, chatsResp] = await Promise.all([
      apiGet<Organization>(`/organizations/${orgId}`),
      apiGet<{ member: Project[]; totalItems: number }>(
        `/projects?organizationId=${orgId}&page=1&itemsPerPage=6&order%5Bid%5D=desc`,
      ),
      apiGet<{ member?: unknown[]; totalItems?: number }>(
        `/organization_members?organizationId=${orgId}&pagination=false`,
      ),
      apiGet<{ member: Chat[] }>(
        `/chats?organizationId=${orgId}&page=1&itemsPerPage=5&order%5BlastMessageAt%5D=desc`,
      ),
    ]);

    if (!orgResp.error && orgResp.data) {
      organization = orgResp.data;
    } else {
      console.error("Failed to fetch organization:", orgResp.status);
    }

    if (!projectsResp.error && projectsResp.data) {
      recentProjects = projectsResp.data.member || [];
      totalProjects = projectsResp.data.totalItems || 0;
    } else {
      console.error("Failed to fetch projects:", projectsResp.status);
    }

    if (!membersResp.error && membersResp.data) {
      totalMembers = membersResp.data.totalItems || 0;
    } else {
      console.error("Failed to fetch members:", membersResp.status);
    }

    if (!chatsResp.error && chatsResp.data) {
      recentChats = chatsResp.data.member || [];
    } else {
      console.error("Failed to fetch chats:", chatsResp.status);
    }
  } catch (error) {
    await rethrowIfRedirect(error);
    console.error("Error fetching organization data:", error);
  }

  return (
    <div className="p-4 space-y-6">
      <PageHeader
        title="Przegląd"
        description="Przegląd organizacji i ostatnich aktywności"
      />

      <OrganizationSummary
        organization={organization}
        recentProjects={recentProjects}
        recentChats={recentChats}
        totalProjects={totalProjects}
        totalMembers={totalMembers}
        organizationId={orgId}
      />
    </div>
  );
}
