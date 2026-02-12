import { Hash, User, Users } from "lucide-react";
import React from "react";

import type { Chat } from "@/types/api/chat";
import type { GroupedChats } from "@/types/ui/grouped-chats";
import type { NavigationItem } from "@/types/ui/navigation-item";

/**
 * Gets display name for a direct chat by showing other participants' names. If chat has a name, returns that.
 * @param chat - The chat object with expanded chatMembers
 * @param currentUserId - The current user's ID
 * @returns Display name with comma-separated names, max 3 before "..."
 */
export function getDirectChatDisplayName(
  chat: Chat,
  currentUserId: number,
): string {
  if (
    chat.name.length > 0 ||
    !chat.chatMembers ||
    chat.chatMembers.length === 0
  ) {
    return chat.name;
  }

  // Filter out current user to get other participants
  const otherParticipants = chat.chatMembers
    .filter((cm) => cm.member.id !== currentUserId)
    .map((cm) => cm.member.username || cm.member.email);

  if (otherParticipants.length === 0) {
    return chat.name;
  }

  // Show up to 3 names, then add "..."
  const maxNames = 3;
  if (otherParticipants.length <= maxNames) {
    return otherParticipants.join(", ");
  }

  return `${otherParticipants.slice(0, maxNames).join(", ")}...`;
}

/**
 * Generates an acronym from a chat name
 * @param chatName - The name of the chat
 * @returns Acronym (max 2 characters)
 */
export function getChatAcronym(chatName: string): string {
  if (!chatName || chatName.length === 0) {
    return "C";
  }

  const words = chatName.trim().split(/\s+/);
  if (words.length === 1) {
    return chatName.slice(0, 2).toUpperCase();
  }

  return words
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Categorizes chats by type and prepares navigation items
 * @param chats - Array of chats to categorize
 * @param currentUserId - The current user's ID
 * @param organizationId - The organization ID for URL construction
 * @returns Grouped chats object with general, direct, and group arrays
 */
export function categorizeChatsByType(
  chats: Chat[],
  currentUserId: number,
  organizationId: string,
): GroupedChats {
  const grouped: GroupedChats = {
    general: [],
    direct: [],
    group: [],
  };

  // Sort chats: by lastMessageAt (most recent first), fallback to createdAt
  const sortedChats = [...chats].sort((a, b) => {
    const aTime = a.lastMessageAt || a.createdAt || "";
    const bTime = b.lastMessageAt || b.createdAt || "";
    return bTime.localeCompare(aTime);
  });

  sortedChats.forEach((chat) => {
    const item: NavigationItem = {
      href: `/organizations/${organizationId}/chats/${chat.id}`,
      icon: React.createElement(Hash, { className: "w-5 h-5" }),
      label: chat.name,
      delay: undefined,
      chat,
    };

    switch (chat.type) {
      case "general":
        item.icon = React.createElement(Hash, { className: "w-5 h-5" });
        grouped.general.push(item);
        break;

      case "direct":
        item.icon = React.createElement(User, { className: "w-5 h-5" });
        item.label = getDirectChatDisplayName(chat, currentUserId);
        grouped.direct.push(item);
        break;

      case "group":
        item.icon = React.createElement(Users, { className: "w-5 h-5" });
        grouped.group.push(item);
        break;

      default:
        // Fallback: treat unknown types as group
        item.icon = React.createElement(Users, { className: "w-5 h-5" });
        grouped.group.push(item);
    }
  });

  return grouped;
}
