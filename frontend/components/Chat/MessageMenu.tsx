import { EllipsisVertical, Reply, Trash2 } from "lucide-react";
import React from "react";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { MessageItemProps } from "./MessageItem";

export interface MessageMenuProps
  extends Omit<
    MessageItemProps,
    | "showAvatar"
    | "showHeader"
    | "senderUser"
    | "organizationId"
    | "mentionData"
  > {
  onReply?: (message: MessageItemProps["message"]) => void;
}

export function MessageMenu({
  isMe,
  message,
  onDeleteMessage,
  onReply,
}: MessageMenuProps) {
  // Single-level replies only: disable reply button if message is already a reply
  const isReply = !!message.parent;
  const canReply = !message.isDeleted && !isReply;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="circular"
          size="dynamic"
          aria-label="Menu wiadomości"
          className="aspect-square p-2 text-gray-600"
        >
          <EllipsisVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!canReply}
            onClick={() => canReply && onReply && onReply(message)}
          >
            <Reply />
            Odpowiedz
          </DropdownMenuItem>
          {isMe && !message.isDeleted && onDeleteMessage && (
            <DropdownMenuItem onClick={() => onDeleteMessage(message.id)}>
              <Trash2 aria-hidden="true" />
              Usuń wiadomość
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
