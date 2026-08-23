import { getDirectChatDisplayName } from "@/services/chat/chat-service";
import { clientApiGet } from "@/services/fetch/client-api-service";
import type { Chat, ChatMember } from "@/types/api/chat";
import type { Collection } from "@/types/api/collection";
import type { Issue } from "@/types/api/issue";
import type { Project } from "@/types/api/project";
import type { Sprint } from "@/types/api/sprint";
import type { UserWithOnlyEmailAndName } from "@/types/api/user";
import { extractIdFromIri } from "@/utils/iri-util";
import { isOk, Ok, type Result } from "@/utils/result";

export interface MentionIssue extends Issue {
  projectSummary?: {
    projectId?: string;
    organizationId?: string;
    name?: string;
  };
}

export interface MentionChat extends Chat {
  displayName?: string;
  organizationId?: string;
}

export interface MentionData {
  users: UserWithOnlyEmailAndName[];
  projects: Project[];
  issues: MentionIssue[];
  sprints: Sprint[];
  chats: MentionChat[];
}

export async function fetchMentionData(
  organizationId: string,
  projectId?: string,
  chatId?: string,
  currentUserId?: number,
): Promise<MentionData> {
  const [projectsRes, chatRes, chatsRes] = await getProjectsAndChat(
    organizationId,
    chatId,
    currentUserId,
  );
  const targetProjectId = getProjectId(chatRes, projectId);
  const [issuesRes, sprintsRes] = await getIssuesAndSprints(targetProjectId);
  const uniqueUsers = await getUniqueUsers(chatRes);

  const projects = (isOk(projectsRes) && projectsRes.value?.member) || [];
  const issues = (isOk(issuesRes) && issuesRes.value?.member) || [];
  const chats = (isOk(chatsRes) && chatsRes.value?.member) || [];

  return {
    users: uniqueUsers,
    projects,
    issues: enrichIssuesWithProjectData(issues, projects),
    sprints: (isOk(sprintsRes) && sprintsRes.value?.member) || [],
    chats: enrichChatsWithDisplayData(chats, organizationId, currentUserId),
  };
}

function enrichIssuesWithProjectData(
  issues: Issue[],
  projects: Project[],
): MentionIssue[] {
  if (!issues.length) {
    return [];
  }

  const projectById = new Map<string, Project>();
  const projectByIri = new Map<string, Project>();

  projects.forEach((project) => {
    if (project.id !== undefined && project.id !== null) {
      projectById.set(project.id.toString(), project);
    }
    if (project["@id"]) {
      projectByIri.set(project["@id"], project);
    }
  });

  return issues.map((issue) => {
    const projectIri = issue.project;
    const derivedProjectId = projectIri
      ? extractIdFromIri(projectIri)
      : undefined;

    let matchedProject: Project | undefined;
    if (derivedProjectId) {
      matchedProject = projectById.get(derivedProjectId);
    }
    if (!matchedProject && projectIri) {
      matchedProject = projectByIri.get(projectIri);
    }

    const projectSummary =
      derivedProjectId || matchedProject
        ? {
            projectId: derivedProjectId,
            organizationId: matchedProject?.organization?.id
              ? matchedProject.organization.id.toString()
              : undefined,
            name: matchedProject?.name,
          }
        : undefined;

    return {
      ...issue,
      projectSummary,
    } satisfies MentionIssue;
  });
}

async function getProjectsAndChat(
  organizationId: string,
  chatId?: string,
  currentUserId?: number,
) {
  const projectsPromise = clientApiGet<Collection<Project>>(
    `/projects?organizationId=${organizationId}`,
  );

  const chatPromise = chatId
    ? clientApiGet<Chat>(`/chats/${chatId}`)
    : Promise.resolve(
        Ok({ chatMembers: [] } as Partial<Chat> as unknown as Chat),
      );

  const chatsPromise = currentUserId
    ? clientApiGet<Collection<Chat>>(
        `/chats?organizationId=${organizationId}&chatMembers.member=${currentUserId}`,
      )
    : Promise.resolve(
        Ok(
          { member: [] } as Partial<
            Collection<Chat>
          > as unknown as Collection<Chat>,
        ),
      );

  return await Promise.all([projectsPromise, chatPromise, chatsPromise]);
}

function getProjectId(chatRes: Result<Chat, unknown>, projectId?: string) {
  let targetProjectId = projectId;

  const extractId = (
    data: string | { id?: string | number; "@id"?: string } | undefined | null,
  ) => {
    if (!data) return undefined;
    if (typeof data === "string") return extractIdFromIri(data);
    if (data.id) return data.id.toString();
    if (data["@id"]) return extractIdFromIri(data["@id"]);
    return undefined;
  };

  if (!targetProjectId && isOk(chatRes) && chatRes.value) {
    const chatData = chatRes.value as ExpandedChat;
    if (chatData.project) {
      targetProjectId = extractId(chatData.project);
    } else if (
      chatData.issue &&
      typeof chatData.issue !== "string" &&
      chatData.issue.project
    ) {
      targetProjectId = extractId(chatData.issue.project);
    } else if (
      chatData.sprint &&
      typeof chatData.sprint !== "string" &&
      chatData.sprint.project
    ) {
      targetProjectId = extractId(chatData.sprint.project);
    }
  }

  return targetProjectId;
}

async function getIssuesAndSprints(targetProjectId?: string) {
  if (targetProjectId) {
    const issuesPromise = clientApiGet<Collection<Issue>>(
      `/issues?projectId=${targetProjectId}`,
    );
    const sprintsPromise = clientApiGet<Collection<Sprint>>(
      `/sprints?project=${targetProjectId}`,
    );
    return await Promise.all([issuesPromise, sprintsPromise]);
  }

  return [
    Ok(
      { member: [] } as Partial<
        Collection<Issue>
      > as unknown as Collection<Issue>,
    ),
    Ok(
      { member: [] } as Partial<
        Collection<Sprint>
      > as unknown as Collection<Sprint>,
    ),
  ];
}

async function getUniqueUsers(chatRes: Result<Chat, unknown>) {
  const chatData = isOk(chatRes) ? chatRes.value : undefined;
  const users =
    chatData?.chatMembers?.map((cm: ChatMember) => cm.member) || [];

  return Array.from(
    new Map(users.map((u: UserWithOnlyEmailAndName) => [u.id, u])).values(),
  ) as UserWithOnlyEmailAndName[];
}

function enrichChatsWithDisplayData(
  chats: Chat[],
  organizationId: string,
  currentUserId?: number,
): MentionChat[] {
  return chats.map((chat) => {
    const displayName =
      chat.type === "direct" && currentUserId
        ? getDirectChatDisplayName(chat, currentUserId)
        : chat.name;

    return {
      ...chat,
      displayName,
      organizationId,
    } satisfies MentionChat;
  });
}

type ResourceWithId = { id?: string | number; "@id"?: string };

type ResourceWithProject = ResourceWithId & {
  project?: string | ResourceWithId;
};

type ExpandedChat = Omit<Chat, "project" | "issue" | "sprint"> & {
  project?: string | ResourceWithId;
  issue?: string | ResourceWithProject;
  sprint?: string | ResourceWithProject;
};
