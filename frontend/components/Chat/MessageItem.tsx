"use client";

import React from "react";

import { Avatar } from "@/components/Avatar";
import type { MentionData } from "@/lib/services/mentionService";
import type {
  ChatMember,
  Message,
  UserWithOnlyEmailAndName,
} from "@/lib/types/api";
import { getUserInitials } from "@/lib/utils/userUtils";

import { MessageContent } from "./MessageContent";
import { MessageMenu } from "./MessageMenu";
import { ReplyIndicator } from "./ReplyIndicator";

export interface MessageItemProps {
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  showHeader: boolean;
  senderUser: UserWithOnlyEmailAndName | null;
  onDeleteMessage?: (messageId: number) => void;
  onReply?: (message: Message) => void;
  parentMessage?: Message;
  onScrollToMessage?: (messageId: number) => void;
  isHighlighted?: boolean;
  mentionData: MentionData;
}

export function MessageItem({
  message,
  isMe,
  showAvatar,
  showHeader,
  senderUser,
  onDeleteMessage,
  onReply,
  parentMessage,
  onScrollToMessage,
  isHighlighted = false,
  mentionData,
}: MessageItemProps) {
  const date = new Date(message.createdAt);

  const getParentSender = (sender: string | ChatMember) => {
    if (typeof sender === "object" && sender.member) {
      return sender.member;
    }
    return null;
  };

  const parentSender = parentMessage
    ? getParentSender(parentMessage.sender)
    : null;

  const handleClickParent = () => {
    if (parentMessage && onScrollToMessage) {
      onScrollToMessage(parentMessage.id);
    }
  };

  const menu = (
    <MessageMenu
      isMe={isMe}
      message={message}
      onDeleteMessage={onDeleteMessage}
      onReply={onReply}
    />
  );

  return (
    <div
      id={`message-${message.id}`}
      className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"} transition-all duration-300 ${
        isHighlighted ? "bg-primary/10 -mx-2 px-2 py-1 rounded-lg" : ""
      }`}
    >
      {!isMe && (
        <div className="w-8 flex-shrink-0">
          {showAvatar && senderUser && (
            <Avatar
              initials={getUserInitials(senderUser)}
              size="small"
              ariaLabel={senderUser.username || senderUser.email}
            />
          )}
        </div>
      )}
      <div
        className={`flex flex-col max-w-[70%] ${
          isMe ? "items-end" : "items-start"
        }`}
      >
        {showHeader && !isMe && senderUser && (
          <span className="text-xs text-gray-500 ml-1 mb-1">
            {senderUser.username || senderUser.email}
          </span>
        )}
        {parentMessage && (
          <ReplyIndicator
            parentMessage={parentMessage}
            parentSender={parentSender}
            onClickParent={handleClickParent}
          />
        )}
        <div className="flex items-center gap-1">
          {isMe && !message.isDeleted && menu}
          <div
            className={`px-4 py-2 rounded-2xl text-sm text-black group relative ${
              isMe
                ? "bg-primary rounded-br-none"
                : "bg-gray-100 rounded-bl-none"
            }`}
          >
            {message.isDeleted ? (
              <span className="italic text-gray-500">Wiadomość usunięta</span>
            ) : (
              <MessageContent
                content={message.content}
                mentionData={mentionData}
              />
            )}
          </div>
          {!isMe && !message.isDeleted && menu}
        </div>
        <span
          className="text-[10px] text-gray-400 mt-1 px-1"
          suppressHydrationWarning
        >
          {date.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
