"use client";

import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import inviteOrganizationMember from "@/actions/inviteOrganizationMember";
import { useAlert } from "@/hooks/useAlert";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { apiGet } from "@/services/fetch/api-service";
import type { OrganizationMember } from "@/types/api/organization";
import type { User } from "@/types/api/user";

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

interface InviteOrganizationMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationIri: string;
  existingMembers: OrganizationMember[];
}

export function InviteOrganizationMemberDialog({
  open,
  onOpenChange,
  organizationId,
  organizationIri,
  existingMembers,
}: InviteOrganizationMemberDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { showError } = useErrorHandler();
  const { notify } = useAlert();

  // Fetch all users
  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet<{ member: User[] }>(
          `/users?pagination=false`,
        );
        setUsers(response.data?.member || []);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [open, showError]);

  // Filter available users (not already in organization)
  const availableUsers = useMemo(() => {
    const existingMemberIds = new Set(
      existingMembers.map((om) => om.member.id),
    );

    return users.filter((user) => !existingMemberIds.has(user.id));
  }, [users, existingMembers]);

  // Filter by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers;

    const query = searchQuery.toLowerCase();
    return availableUsers.filter(
      (user) =>
        user.username?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [availableUsers, searchQuery]);

  const handleInvite = async () => {
    if (!selectedUser) return;

    setIsInviting(true);
    try {
      const result = await inviteOrganizationMember(null, {
        organizationId,
        organizationIri,
        memberIri: selectedUser["@id"],
      });

      if (result.ok) {
        notify({
          type: "default",
          title: "Członek zaproszony",
          description: `${selectedUser.username || selectedUser.email} został dodany do organizacji.`,
          duration: 4000,
          hasCloseButton: true,
          icon: "check",
        });
        onOpenChange(false);
        setSelectedUser(null);
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
          <DialogTitle>Zaproś członka do organizacji</DialogTitle>
          <DialogDescription>
            Wybierz użytkownika, którego chcesz dodać do organizacji
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
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {availableUsers.length === 0
                ? "Wszyscy użytkownicy są już członkami organizacji"
                : "Nie znaleziono użytkowników"}
            </div>
          ) : (
            <div className="h-[300px] overflow-y-auto rounded-md border">
              <div className="p-2 space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    disabled={isInviting}
                    className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors ${
                      selectedUser?.id === user.id
                        ? "bg-accent ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <Avatar
                      initials={
                        user.username
                          ? user.username.slice(0, 2).toUpperCase()
                          : user.email.slice(0, 2).toUpperCase()
                      }
                      size="medium"
                      ariaLabel={user.username || user.email}
                    />
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">
                        {user.username || user.email}
                      </span>
                      {user.username && (
                        <span className="text-xs text-muted-foreground">
                          {user.email}
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
              setSelectedUser(null);
              setSearchQuery("");
            }}
            disabled={isInviting}
          >
            Anuluj
          </Button>
          <Button onClick={handleInvite} disabled={!selectedUser || isInviting}>
            {isInviting && <Loader2 className="h-4 w-4 animate-spin" />}
            Zaproś
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
