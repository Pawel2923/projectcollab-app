"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useMercureObserver } from "@/hooks/useMercureObserver";
import {
  handleSessionExpired,
  refreshSession,
} from "@/services/auth/client-token-refresh";
import { apiGet } from "@/services/fetch/api-service";
import { fetchApiLog } from "@/services/log/fetch-api-log";
import type { Chat } from "@/types/api/chat";
import type { Collection } from "@/types/api/collection";

interface UseChatUpdatesOptions {
  organizationId: string;
  currentUserId: number;
  initialChats: Chat[];
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
}: UseChatUpdatesOptions): UseChatUpdatesReturn {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  const handleUpdate = async (data: Chat) => {
    fetchApiLog({
      level: "debug",
      message: "Received Mercure message for chat updates",
      serviceName: "useChatUpdates",
      context: {
        data,
      },
    });

    // If a chat was created or updated, refetch the chat list
    if (data["@type"] === "Chat" || data.id) {
      fetchApiLog({
        level: "debug",
        message: "Refetching chat list",
        serviceName: "useChatUpdates",
        context: {
          organizationId,
          currentUserId,
        },
      });
      setIsLoading(true);

      const query = `/chats?organizationId=${organizationId}&chatMembers.member=${currentUserId}`;
      let chatsResponse = await apiGet<Collection<Chat>>(query);

      // Silent refresh retry logic for the API call
      if (chatsResponse.status === 401) {
        fetchApiLog({
          level: "debug",
          message:
            "401 detected while fetching chats, attempting silent refresh",
          serviceName: "useChatUpdates",
          context: {
            organizationId,
            currentUserId,
          },
        });
        const refreshed = await refreshSession();
        if (refreshed) {
          fetchApiLog({
            level: "debug",
            message: "Refresh successful, retrying chat fetch",
            serviceName: "useChatUpdates",
            context: {
              organizationId,
              currentUserId,
            },
          });
          chatsResponse = await apiGet<Collection<Chat>>(query);
        } else {
          fetchApiLog({
            level: "error",
            message: "Refresh failed while fetching chats",
            serviceName: "useChatUpdates",
            context: {
              organizationId,
              currentUserId,
            },
          });
          handleSessionExpired();
          return;
        }
      }

      if (chatsResponse.data) {
        const updatedChats = chatsResponse.data.member || [];
        fetchApiLog({
          level: "debug",
          message: "Updated chats fetched",
          serviceName: "useChatUpdates",
          context: {
            updatedChatsCount: updatedChats.length,
          },
        });
        setChats(updatedChats);

        router.refresh();
      } else {
        fetchApiLog({
          level: "error",
          message: "Failed to fetch chats",
          serviceName: "useChatUpdates",
          context: {
            organizationId,
            currentUserId,
          },
        });
      }

      setIsLoading(false);
    }
  };

  useMercureObserver<Chat>({
    topics: [`/users/${currentUserId}/chats`],
    onUpdate: handleUpdate,
  });

  return { chats, isLoading };
}
