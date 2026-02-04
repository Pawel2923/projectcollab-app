"use client";

import React, { useEffect, useState } from "react";

import { deleteMessage } from "@/actions/chat";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import { useMentionData } from "@/lib/hooks/useMentionData";
import type { ChatMember, Collection, Message } from "@/lib/types/api";
import { apiGet } from "@/lib/utils/apiClient";

import { ChatWindowMenu } from "./ChatWindowMenu";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

interface ChatWindowProps {
  chatIri: string;
  chatId: string;
  initialMessages: Message[];
  currentUserId: string;
  mercureUrl: string;
  initialDate: string;
  totalChatMessages: number;
  organizationId: string;
  chatMembers: ChatMember[];
}

export function ChatWindow({
  chatIri,
  chatId,
  initialMessages,
  currentUserId,
  mercureUrl,
  initialDate,
  totalChatMessages,
  organizationId,
  chatMembers,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [oldestLoadedDate, setOldestLoadedDate] = useState<Date>(
    new Date(initialDate),
  );
  const [remainingOlderMessages, setRemainingOlderMessages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [parentMessages, setParentMessages] = useState<Map<string, Message>>(
    new Map(),
  );
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    number | null
  >(null);
  const { showError } = useErrorHandler();
  const { data: mentionData } = useMentionData(
    organizationId,
    undefined,
    chatId,
    parseInt(currentUserId, 10),
  );

  useEffect(() => {
    setMessages([...initialMessages].reverse());
    setOldestLoadedDate(new Date(initialDate));

    const loadedCount = initialMessages.length;
    setRemainingOlderMessages(Math.max(0, totalChatMessages - loadedCount));
  }, [initialMessages, initialDate, totalChatMessages]);

  useMercureObserver<Message>({
    hubUrl: mercureUrl,
    topics: [`/chats/${chatId}`],
    onUpdate: (data) => {
      let messageData = data;
      if (messageData.parent && typeof messageData.parent === "object") {
        console.warn(
          "Received parent as object, converting to IRI:",
          messageData.parent,
        );
        messageData = {
          ...messageData,
          parent: (messageData.parent as { "@id": string })["@id"],
        };
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === messageData.id)) {
          return prev.map((m) => (m.id === messageData.id ? messageData : m));
        }
        return [...prev, messageData];
      });
    },
  });

  const handleDeleteMessage = async (messageId: number): Promise<void> => {
    try {
      const result = await deleteMessage(messageId);

      if (result.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true } : m)),
        );
      } else {
        showError(result, {
          customMessage: "Nie udało się usunąć wiadomości",
        });
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleScrollToMessage = (messageId: number) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
  };

  useEffect(() => {
    const fetchParentMessages = async () => {
      const parentsToFetch = messages
        .filter((m) => {
          if (!m.parent) return false;

          const parentIri =
            typeof m.parent === "string" ? m.parent : m.parent["@id"];

          return !parentMessages.has(parentIri);
        })
        .map((m) => {
          return typeof m.parent === "string"
            ? m.parent
            : (m.parent as { "@id": string })["@id"];
        });

      if (parentsToFetch.length === 0) return;

      try {
        const fetchPromises = parentsToFetch.map((parentIri) =>
          apiGet<Message>(parentIri),
        );
        const results = await Promise.all(fetchPromises);

        setParentMessages((prevParents) => {
          const newParents = new Map(prevParents);
          results.forEach((result) => {
            if (result?.data) {
              newParents.set(result.data["@id"], result.data);
            }
          });
          return newParents;
        });
      } catch (error) {
        console.error("Error fetching parent messages:", error);
      }
    };

    fetchParentMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const targetDate = new Date(oldestLoadedDate);
      targetDate.setDate(targetDate.getDate() - 1);

      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await apiGet<Collection<Message>>(
        `/messages?chat=${chatId}&order[createdAt]=desc&createdAt[after]=${startOfDay.toISOString()}&createdAt[before]=${endOfDay.toISOString()}&pagination=false`,
      );

      const newMessages = response.data?.member || [];

      if (newMessages.length > 0) {
        const reversedNewMessages = [...newMessages].reverse();

        setMessages((prev) => {
          const uniqueNewMessages = reversedNewMessages.filter(
            (newMsg) =>
              !prev.some((existingMsg) => existingMsg.id === newMsg.id),
          );
          return [...uniqueNewMessages, ...prev];
        });

        setRemainingOlderMessages((prev) =>
          Math.max(0, prev - newMessages.length),
        );
      }

      setOldestLoadedDate(startOfDay);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const hasMore = remainingOlderMessages > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-116px)] relative bg-background rounded-lg border border-border overflow-hidden">
      <ChatWindowMenu
        chatId={chatId}
        chatIri={chatIri}
        organizationId={organizationId}
        chatMembers={chatMembers}
      />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        onDeleteMessage={handleDeleteMessage}
        onReply={handleReply}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        parentMessages={parentMessages}
        onScrollToMessage={handleScrollToMessage}
        highlightedMessageId={highlightedMessageId}
        mentionData={mentionData}
      />
      <MessageInput
        chatIri={chatIri}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
      />
    </div>
  );
}
