"use client";

import { Loader2Icon, Send } from "lucide-react";
import React, { useState } from "react";

import { sendMessage } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { ChatMember, Message } from "@/lib/types/api";

import { ReplyPreview } from "./ReplyPreview";

interface MessageInputProps {
  chatIri: string;
  onMessageSent?: () => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

export function MessageInput({
  chatIri,
  onMessageSent,
  replyingTo,
  onCancelReply,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useErrorHandler();

  const getSenderUser = (sender: string | ChatMember) => {
    if (typeof sender === "object" && sender.member) {
      return sender.member;
    }
    return null;
  };

  const handleSend = async (): Promise<void> => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const result = await sendMessage(
        chatIri,
        content,
        replyingTo ? replyingTo["@id"] : undefined,
      );

      if (result.ok) {
        setContent("");
        onCancelReply?.();
        onMessageSent?.();
      } else {
        showError(result, {
          customMessage: "Nie udało się wysłać wiadomości",
        });
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col border-t border-border bg-background">
      {replyingTo && onCancelReply && (
        <ReplyPreview
          message={replyingTo}
          sender={getSenderUser(replyingTo.sender)}
          onCancel={onCancelReply}
        />
      )}
      <div className="flex gap-2 p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Napisz wiadomość..."
          className="min-h-[50px] resize-none"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !content.trim()}
          size="default"
          className="h-full"
        >
          <Send aria-hidden="true" />
          Wyślij
          {isLoading && <Loader2Icon className="animate-spin ml-2" />}
        </Button>
      </div>
    </div>
  );
}
