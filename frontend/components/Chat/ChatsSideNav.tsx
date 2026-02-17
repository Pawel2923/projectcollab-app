"use client";

import React from "react";

import { ServerSideNav } from "@/components/ServerSideNav";
import { LoadingSpinner } from "@/components/ui/loading";
import { useChatUpdates } from "@/hooks/useChatUpdates";
import { categorizeChatsByType } from "@/services/chat/chat-service";
import type { Chat } from "@/types/api/chat";

interface ChatsSideNavProps {
  organizationId: string;
  currentUserId: number;
  initialChats: Chat[];
  mercureUrl: string;
  directChatsExpanded: boolean;
  groupChatsExpanded: boolean;
  isSideNavExpanded?: boolean;
}

export function ChatsSideNav({
  organizationId,
  currentUserId,
  initialChats,
  mercureUrl,
  directChatsExpanded,
  groupChatsExpanded,
  isSideNavExpanded,
}: ChatsSideNavProps) {
  console.log(
    "[ChatsSideNav] Rendered. initialChats length:",
    initialChats.length,
    "currentUserId:",
    currentUserId,
  );

  const { chats, isLoading } = useChatUpdates({
    organizationId,
    currentUserId,
    initialChats,
    mercureUrl,
  });

  const groupedChats = categorizeChatsByType(
    chats,
    currentUserId,
    organizationId,
  );

  if (isLoading && chats.length === 0) {
    return (
      <nav className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-gray-900 min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ładowanie czatów...
        </p>
      </nav>
    );
  }

  return (
    <ServerSideNav
      contentId={organizationId}
      contentType="chat"
      groupedChats={groupedChats}
      directChatsExpanded={directChatsExpanded}
      groupChatsExpanded={groupChatsExpanded}
      isSideNavExpanded={isSideNavExpanded}
      organizationId={organizationId}
    />
  );
}
