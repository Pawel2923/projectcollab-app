import { useEffect, useState } from "react";

import {
  fetchMentionData,
  type MentionData,
} from "@/services/chat/mention-data-fetcher";
import { fetchApiLog } from "@/services/log/fetch-api-log";

export function useMentionData(
  organizationId: string,
  projectId?: string,
  chatId?: string,
  currentUserId?: number,
) {
  const [data, setData] = useState<MentionData>({
    users: [],
    projects: [],
    issues: [],
    sprints: [],
    chats: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const result = await fetchMentionData(
          organizationId,
          projectId,
          chatId,
          currentUserId,
        );
        if (isMounted) {
          setData(result);
        }
      } catch (error) {
        fetchApiLog({
          level: "error",
          message: "Failed to fetch mention data",
          serviceName: "useMentionData",
          context: {
            error,
            organizationId,
            projectId,
            chatId,
            currentUserId,
          },
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (organizationId) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [organizationId, projectId, chatId, currentUserId]);

  return { data, isLoading };
}
