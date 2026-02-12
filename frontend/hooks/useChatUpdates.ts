"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useMercureObserver } from "@/hooks/useMercureObserver";
import { apiGet } from "@/lib/utils/apiClient";
import {
  handleSessionExpired,
  refreshSession,
} from "@/lib/utils/clientTokenRefresh";
import type { Chat } from "@/types/api/chat";
import type { Collection } from "@/types/api/collection";

interface UseChatUpdatesOptions {
  organizationId: string;
  currentUserId: number;
  initialChats: Chat[];
  mercureUrl: string;
}

interface UseChatUpdatesReturn {
  chats: Chat[];
  isLoading: boolean;
}

/**
 * Custom hook to manage real-time chat updates via Mercure
 * Subscribes to chat updates and refetches the chat list when changes occur
 */
export function useChatUpdates({
  organizationId,
  currentUserId,
  initialChats,
  mercureUrl,
}: UseChatUpdatesOptions): UseChatUpdatesReturn {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  const handleUpdate = async (data: Chat) => {
    console.log("[useChatUpdates] Received Mercure message:", data);

    // If a chat was created or updated, refetch the chat list
    if (data["@type"] === "Chat" || data.id) {
      console.log("[useChatUpdates] Refetching chat list...");
      setIsLoading(true);

      const query = `/chats?organizationId=${organizationId}&chatMembers.member=${currentUserId}`;
      let chatsResponse = await apiGet<Collection<Chat>>(query);

      // Silent refresh retry logic for the API call
      if (chatsResponse.status === 401) {
        console.log(
          "[useChatUpdates] 401 detected, attempting silent refresh...",
        );
        const refreshed = await refreshSession();
        if (refreshed) {
          console.log("[useChatUpdates] Refresh successful, retrying fetch...");
          chatsResponse = await apiGet<Collection<Chat>>(query);
        } else {
          console.log("[useChatUpdates] Refresh failed, redirecting...");
          handleSessionExpired();
          return;
        }
      }

      if (chatsResponse.data) {
        const updatedChats = chatsResponse.data.member || [];
        console.log("[useChatUpdates] Updated chats:", updatedChats.length);
        setChats(updatedChats);

        router.refresh();
      } else {
        console.error("[useChatUpdates] Failed to fetch chats");
      }

      setIsLoading(false);
    }
  };

  useMercureObserver<Chat>({
    hubUrl: mercureUrl,
    topics: [`/users/${currentUserId}/chats`],
    onUpdate: handleUpdate,
  });

  return { chats, isLoading };
}
