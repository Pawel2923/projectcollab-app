"use client";

import { EllipsisVertical, UserPlus } from "lucide-react";
import React, { useState } from "react";

import { useEntityRole } from "@/hooks/useEntityRole";
import { hasPermission } from "@/lib/utils/permissions";
import type { ChatMember } from "@/types/api/chat";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { InviteMemberDialog } from "./InviteMemberDialog";

interface ChatWindowMenuProps {
  chatId: string;
  chatIri: string;
  organizationId: string;
  chatMembers: ChatMember[];
}

export function ChatWindowMenu({
  chatId,
  chatIri,
  organizationId,
  chatMembers,
}: ChatWindowMenuProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { role: currentUserRole } = useEntityRole("chat", chatId);

  const canInviteMembers =
    currentUserRole && hasPermission(currentUserRole, "MODERATOR");

  if (!canInviteMembers) {
    return null;
  }

  return (
    <div className="flex items-center justify-end px-4 py-2 border-b border-border bg-background">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="circular" size="dynamic">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setInviteDialogOpen(true)}>
              <UserPlus />
              Zaproś do czatu
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        chatId={chatId}
        chatIri={chatIri}
        organizationId={organizationId}
        existingMembers={chatMembers}
      />
    </div>
  );
}
