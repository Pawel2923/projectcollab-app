"use client";

import { PlusIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { OrganizationMember } from "@/types/api/organization";
import type { ChatLinkedResources } from "@/types/ui/chat-linked-resources";

import { AddChatForm } from "./AddChatForm";

type AddChatModal = {
  organizationId?: string;
  organizationMembers?: OrganizationMember[];
  currentUserId?: number;
  chatResources?: ChatLinkedResources;
  trigger?: React.ReactElement;
};

export function AddChatModal({
  organizationId,
  organizationMembers,
  currentUserId,
  chatResources,
  trigger,
}: AddChatModal) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="text-foreground active:text-opacity-70">
            <PlusIcon /> Dodaj czat
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj nowy czat</DialogTitle>
        </DialogHeader>
        <AddChatForm
          organizationId={organizationId}
          organizationMembers={organizationMembers}
          currentUserId={currentUserId}
          chatResources={chatResources}
        />
      </DialogContent>
    </Dialog>
  );
}
