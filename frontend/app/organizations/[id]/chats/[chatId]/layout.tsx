import { cookies } from "next/headers";
import React from "react";

import { ChatsSideNav } from "@/components/Chat/ChatsSideNav";
import { TopNav } from "@/components/TopNav";
import { ErrorBoundary } from "@/error/ErrorBoundary";
import { getCurrentUser } from "@/lib/services/userService";
import { apiGet, rethrowIfRedirect } from "@/lib/utils/apiClient";
import type { Chat } from "@/types/api/chat";
import type { Collection } from "@/types/api/collection";
import type { Issue } from "@/types/api/issue";
import type { OrganizationMember } from "@/types/api/organization";
import type { Project, ProjectMember } from "@/types/api/project";
import type { Sprint } from "@/types/api/sprint";
import type { ChatLinkedResources } from "@/types/ui/chat-linked-resources";

export const dynamic = "force-dynamic";

export default async function ChatsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string; chatId: string }>;
}) {
  const { id: organizationId } = await params;

  let chats: Chat[] = [];
  let currentUserId: number | undefined;
  let organizationMembers: OrganizationMember[] = [];
  let chatResources: ChatLinkedResources = { projects: [] };

  try {
    const userResult = await getCurrentUser();

    if (userResult.ok) {
      const user = userResult.value;
      currentUserId = user.id;

      const chatsResponse = await apiGet<Collection<Chat>>(
        `/chats?organizationId=${organizationId}&chatMembers.member=${user.id}`,
      );
      chats = chatsResponse.data?.member || [];

      const membersResponse = await apiGet<Collection<OrganizationMember>>(
        `/organization_members?organizationId=${organizationId}`,
      );
      organizationMembers = membersResponse.data?.member || [];

      const projectsResponse = await apiGet<Collection<Project>>(
        `/projects?organizationId=${organizationId}`,
      );
      const projects = projectsResponse.data?.member || [];

      const projectResources = await Promise.all(
        projects.map(async (project) => {
          const [membersRes, sprintsRes, issuesRes] = await Promise.all([
            apiGet<Collection<ProjectMember>>(
              `/project_members/?projectId=${project.id}`,
            ),
            apiGet<Collection<Sprint>>(`/sprints?project=${project.id}`),
            apiGet<Collection<Issue>>(`/issues?projectId=${project.id}`),
          ]);

          return {
            project,
            members: membersRes.data?.member || [],
            sprints: sprintsRes.data?.member || [],
            issues: issuesRes.data?.member || [],
          } satisfies ChatLinkedResources["projects"][number];
        }),
      );

      chatResources = { projects: projectResources };
    }
  } catch (e) {
    await rethrowIfRedirect(e);
    console.error("Failed to fetch chats:", e);
  }

  // Get collapse state from cookies
  const cookieStore = await cookies();
  const directChatsExpandedCookie = cookieStore.get("pc_direct_chats_expanded");
  const groupChatsExpandedCookie = cookieStore.get("pc_group_chats_expanded");
  const isSideNavExpandedCookie = cookieStore.get("pc_side_nav_expanded");

  let directChatsExpanded: boolean;
  let groupChatsExpanded: boolean;

  try {
    directChatsExpanded = JSON.parse(
      directChatsExpandedCookie?.value || "true",
    );
  } catch {
    directChatsExpanded = true;
  }

  try {
    groupChatsExpanded = JSON.parse(groupChatsExpandedCookie?.value || "true");
  } catch {
    groupChatsExpanded = true;
  }

  let isSideNavExpanded: boolean;
  try {
    isSideNavExpanded = JSON.parse(isSideNavExpandedCookie?.value || "true");
  } catch {
    isSideNavExpanded = true;
  }

  const mercureUrl =
    process.env.NEXT_PUBLIC_MERCURE_URL ||
    "http://localhost/.well-known/mercure";

  return (
    <div className="grid grid-rows-[auto_auto_1fr] md:grid-rows-[auto_1fr] grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
      <TopNav
        organizationId={organizationId}
        organizationMembers={organizationMembers}
        currentUserId={currentUserId}
        chatResources={chatResources}
      />
      <ErrorBoundary>
        <ChatsSideNav
          organizationId={organizationId}
          currentUserId={currentUserId || 0}
          initialChats={chats}
          mercureUrl={mercureUrl}
          directChatsExpanded={directChatsExpanded}
          groupChatsExpanded={groupChatsExpanded}
          isSideNavExpanded={isSideNavExpanded}
        />
      </ErrorBoundary>
      <main className="flex flex-col col-start-1 row-start-3 p-4 gap-2 overflow-y-auto bg-light md:col-start-2 md:row-start-2">
        {children}
      </main>
    </div>
  );
}
