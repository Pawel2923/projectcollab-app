"use client";

import React, { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import type { MentionData } from "@/services/mentionService";
import type { ChatMember, Message } from "@/types/api/chat";

import { DateSeparator } from "./DateSeparator";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  onDeleteMessage?: (messageId: number) => void;
  onReply?: (message: Message) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  parentMessages?: Map<string, Message>;
  onScrollToMessage?: (messageId: number) => void;
  highlightedMessageId?: number | null;
  mentionData: MentionData;
}

export function MessageList({
  messages,
  currentUserId,
  onDeleteMessage,
  onReply,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  parentMessages = new Map(),
  onScrollToMessage,
  highlightedMessageId,
  mentionData,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on initial mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getSenderUser = (sender: string | ChatMember) => {
    if (typeof sender === "object" && sender.member) {
      return sender.member;
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Ładowanie..." : "Załaduj starsze wiadomości"}
          </Button>
        </div>
      )}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
          <p className="text-lg font-medium">Brak wiadomości</p>
          <p className="text-sm">Rozpocznij konwersację wysyłając wiadomość.</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const senderUser = getSenderUser(message.sender);
          const isMe = senderUser?.id?.toString() === currentUserId;
          const prevMessage = messages[index - 1];
          const isSameSender =
            prevMessage &&
            getSenderUser(prevMessage.sender)?.id === senderUser?.id;
          const showAvatar = !isMe && !isSameSender;
          const showHeader = !isSameSender;

          const date = new Date(message.createdAt);
          const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;
          const showDateSeparator =
            !prevDate || date.toDateString() !== prevDate.toDateString();

          const parentIri = message.parent
            ? typeof message.parent === "string"
              ? message.parent
              : message.parent["@id"]
            : undefined;

          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && <DateSeparator date={date} />}
              <MessageItem
                message={message}
                isMe={isMe}
                showAvatar={showAvatar}
                showHeader={showHeader}
                senderUser={senderUser}
                onDeleteMessage={onDeleteMessage}
                onReply={onReply}
                parentMessage={
                  parentIri ? parentMessages.get(parentIri) : undefined
                }
                onScrollToMessage={onScrollToMessage}
                isHighlighted={highlightedMessageId === message.id}
                mentionData={mentionData}
              />
            </React.Fragment>
          );
        })
      )}
    </div>
  );
}
