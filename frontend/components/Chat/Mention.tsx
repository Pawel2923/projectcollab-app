import Link from "next/link";
import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MentionChat, MentionIssue } from "@/services/mentionService";
import type { Chat } from "@/types/api/chat";
import type { Project } from "@/types/api/project";
import type { Sprint } from "@/types/api/sprint";
import type { UserWithOnlyEmailAndName } from "@/types/api/user";

type MentionType = "user" | "context";

interface MentionProps {
  type: MentionType;
  text: string;
  data?: UserWithOnlyEmailAndName | Project | MentionIssue | Sprint | Chat;
}

export function Mention({ type, text, data }: MentionProps) {
  if (!data) {
    return <span className="text-blue-500">{text}</span>;
  }

  let href = "#";
  let title = "";
  let description = "";

  if (type !== "user") {
    if (isMentionIssue(data)) {
      const issue = data;

      const projectId =
        issue.projectSummary?.projectId ||
        (typeof issue.project === "string"
          ? issue.project.split("/").pop() || ""
          : "");
      const orgId = issue.projectSummary?.organizationId;

      if (projectId && orgId) {
        href = `/organizations/${orgId}/projects/${projectId}/issues/${issue.id}`;
      } else {
        href = `/issues/${issue.id}`;
      }

      const issueTitle = issue.title ? ` — ${issue.title}` : "";
      title = `${issue.key}${issueTitle}`;
      description = issue.projectSummary?.name || "Zadanie";
    } else if (isMentionChat(data)) {
      const chat = data as MentionChat;
      const chatOrgId = chat.organizationId;
      if (chatOrgId) {
        href = `/organizations/${chatOrgId}/chats/${chat.id}`;
      }
      title = chat.displayName || chat.name;
      const typeLabel =
        chat.type === "general"
          ? "Ogólny"
          : chat.type === "direct"
            ? "Bezpośredni"
            : "Grupowy";
      description = `Czat (${typeLabel})`;
    } else if ((data as Project).organization) {
      const project = data as Project;
      href = `/organizations/${project.organization.id}/projects/${project.id}`;
      title = project.name;
      description = "Projekt";
    } else if ((data as Sprint).startDate) {
      const sprint = data as Sprint;
      href = "#";
      title = sprint.name;
      description = `Sprint (${new Date(sprint.startDate!).toLocaleDateString()} - ${new Date(sprint.endDate!).toLocaleDateString()})`;
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className="text-blue-600 hover:underline font-medium bg-blue-50 px-1 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            {text}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col">
            <span className="font-bold">{title}</span>
            <span className="text-xs text-gray-500">{description}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function isMentionIssue(data: unknown): data is MentionIssue {
  return Boolean(
    data &&
      typeof data === "object" &&
      "key" in data &&
      typeof (data as { key?: unknown }).key === "string",
  );
}

function isMentionChat(data: unknown): data is MentionChat {
  return Boolean(
    data &&
      typeof data === "object" &&
      "@type" in data &&
      (data as { "@type"?: unknown })["@type"] === "Chat",
  );
}
