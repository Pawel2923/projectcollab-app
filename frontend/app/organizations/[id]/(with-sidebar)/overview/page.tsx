import { redirect } from "next/navigation";
import React from "react";

import { OrganizationSummary } from "@/components/Organization/OrganizationSummary";
import { PageHeader } from "@/components/PageHeader";
import { getAccessTokenReadOnly } from "@/services/auth/token-read-service";
import { apiGet, rethrowIfRedirect } from "@/services/fetch/api-service";
import { logToServer } from "@/services/log/server-logger";
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
      await logToServer({
        level: "error",
        message: "Failed to fetch organization",
        serviceName: "page.organization.overview",
        context: { status: orgResp.status },
      });
    }

    if (!projectsResp.error && projectsResp.data) {
      recentProjects = projectsResp.data.member || [];
      totalProjects = projectsResp.data.totalItems || 0;
    } else {
      await logToServer({
        level: "error",
        message: "Failed to fetch projects",
        serviceName: "page.organization.overview",
        context: { status: projectsResp.status },
      });
    }

    if (!membersResp.error && membersResp.data) {
      totalMembers = membersResp.data.totalItems || 0;
    } else {
      await logToServer({
        level: "error",
        message: "Failed to fetch members",
        serviceName: "page.organization.overview",
        context: { status: membersResp.status },
      });
    }

    if (!chatsResp.error && chatsResp.data) {
      recentChats = chatsResp.data.member || [];
    } else {
      await logToServer({
        level: "error",
        message: "Failed to fetch chats",
        serviceName: "page.organization.overview",
        context: { status: chatsResp.status },
      });
    }
  } catch (error) {
    await rethrowIfRedirect(error);
    await logToServer({
      level: "error",
      message: "Error fetching organization data",
      serviceName: "page.organization.overview",
      context: { error: String(error) },
      errorStack: (error as Error)?.stack,
    });
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
