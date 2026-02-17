"use client";

import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import inviteChatMember from "@/actions/chat/inviteChatMember";
import { useAlert } from "@/hooks/useAlert";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { apiGet } from "@/services/fetch/api-service";
import type { ChatMember } from "@/types/api/chat";
import type { OrganizationMember } from "@/types/api/organization";

import { Avatar } from "../Avatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  chatIri: string;
  organizationId: string;
  existingMembers: ChatMember[];
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  chatId,
  chatIri,
  organizationId,
  existingMembers,
}: InviteMemberDialogProps) {
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] =
    useState<OrganizationMember | null>(null);
  const { showError } = useErrorHandler();
  const { notify } = useAlert();

  // Fetch organization members
  useEffect(() => {
    if (!open) return;

    const fetchOrgMembers = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet<{ member: OrganizationMember[] }>(
          `/organization_members?organizationId=${organizationId}&pagination=false`,
        );
        setOrgMembers(response.data?.member || []);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgMembers();
  }, [open, organizationId, showError]);

  // Filter available members (not already in chat)
  const availableMembers = useMemo(() => {
    const existingMemberIds = new Set(
      existingMembers.map((cm) => cm.member.id),
    );

    return orgMembers.filter((om) => !existingMemberIds.has(om.member.id));
  }, [orgMembers, existingMembers]);

  // Filter by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return availableMembers;

    const query = searchQuery.toLowerCase();
    return availableMembers.filter(
      (om) =>
        om.member.username?.toLowerCase().includes(query) ||
        om.member.email.toLowerCase().includes(query),
    );
  }, [availableMembers, searchQuery]);

  const handleInvite = async () => {
    if (!selectedMember) return;

    setIsInviting(true);
    try {
      const result = await inviteChatMember(null, {
        chatId,
        chatIri,
        memberIri: selectedMember.member["@id"],
        organizationId,
      });

      if (result.ok) {
        notify({
          type: "default",
          title: "Członek zaproszony",
          description: `${selectedMember.member.username || selectedMember.member.email} został dodany do czatu.`,
          duration: 4000,
          hasCloseButton: true,
          icon: "check",
        });
        onOpenChange(false);
        setSelectedMember(null);
        setSearchQuery("");
      } else {
        notify({
          type: "destructive",
          title: "Błąd",
          description: result.message || "Nie udało się zaprosić członka",
          duration: 5000,
          hasCloseButton: true,
        });
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Zaproś członka do czatu</DialogTitle>
          <DialogDescription>
            Wybierz członka organizacji, którego chcesz dodać do czatu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Szukaj po nazwie lub emailu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading || isInviting}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {availableMembers.length === 0
                ? "Wszyscy członkowie organizacji są już w czacie"
                : "Nie znaleziono członków"}
            </div>
          ) : (
            <div className="h-[300px] overflow-y-auto rounded-md border">
              <div className="p-2 space-y-1">
                {filteredMembers.map((om) => (
                  <button
                    key={om.id}
                    type="button"
                    onClick={() => setSelectedMember(om)}
                    disabled={isInviting}
                    className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors ${
                      selectedMember?.id === om.id
                        ? "bg-accent ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <Avatar
                      initials={
                        om.member.username
                          ? om.member.username.slice(0, 2).toUpperCase()
                          : om.member.email.slice(0, 2).toUpperCase()
                      }
                      size="medium"
                      ariaLabel={om.member.username || om.member.email}
                    />
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">
                        {om.member.username || om.member.email}
                      </span>
                      {om.member.username && (
                        <span className="text-xs text-muted-foreground">
                          {om.member.email}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedMember(null);
              setSearchQuery("");
            }}
            disabled={isInviting}
          >
            Anuluj
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!selectedMember || isInviting}
          >
            {isInviting && <Loader2 className="h-4 w-4 animate-spin" />}
            Zaproś
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
