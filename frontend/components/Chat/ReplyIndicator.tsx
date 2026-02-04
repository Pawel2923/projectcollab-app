"use client";

import { CornerDownRight } from "lucide-react";
import React from "react";

import type { Message, UserWithOnlyEmailAndName } from "@/lib/types/api";

export interface ReplyIndicatorProps {
  parentMessage: Message;
  parentSender: UserWithOnlyEmailAndName | null;
  onClickParent?: () => void;
}

export function ReplyIndicator({
  parentMessage,
  parentSender,
  onClickParent,
}: ReplyIndicatorProps) {
  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div
      className={`flex items-start gap-2 mb-2 px-3 py-2 rounded-lg bg-gray-50 border-l-4 border-primary/50 cursor-pointer hover:bg-gray-100 transition-colors ${
        onClickParent ? "cursor-pointer" : "cursor-default"
      }`}
      onClick={onClickParent}
      role={onClickParent ? "button" : undefined}
      tabIndex={onClickParent ? 0 : undefined}
      onKeyDown={
        onClickParent
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClickParent();
              }
            }
          : undefined
      }
    >
      <CornerDownRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-700 mb-0.5">
          {parentSender?.username ||
            parentSender?.email ||
            "Nieznany użytkownik"}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {parentMessage.isDeleted
            ? "Wiadomość usunięta"
            : truncateContent(parentMessage.content)}
        </div>
      </div>
    </div>
  );
}
