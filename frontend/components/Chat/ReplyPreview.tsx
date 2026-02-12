"use client";

import { X } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import type { Message } from "@/types/api/chat";
import type { UserWithOnlyEmailAndName } from "@/types/api/user";

export interface ReplyPreviewProps {
  message: Message;
  sender: UserWithOnlyEmailAndName | null;
  onCancel: () => void;
}

export function ReplyPreview({ message, sender, onCancel }: ReplyPreviewProps) {
  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-l-4 border-primary rounded-t-lg">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-700 mb-1">
          Odpowiedz na wiadomość użytkownika{" "}
          {sender?.username || sender?.email || "Nieznany użytkownik"}
        </div>
        <div className="text-sm text-gray-600 truncate">
          {message.isDeleted
            ? "Wiadomość usunięta"
            : truncateContent(message.content)}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onCancel}
        className="flex-shrink-0 h-8 w-8"
        aria-label="Anuluj odpowiedź"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
