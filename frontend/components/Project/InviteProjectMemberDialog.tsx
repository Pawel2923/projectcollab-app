"use client";

import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import inviteProjectMember from "@/actions/inviteProjectMember";
import { useAlert } from "@/hooks/useAlert";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type {
  OrganizationMember,
  ProjectMember,
  ProjectRole,
} from "@/lib/types/api";
import { apiGet } from "@/lib/utils/apiClient";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface InviteProjectMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  projectId: string;
  projectIri: string;
  existingMembers: ProjectMember[];
}

export function InviteProjectMemberDialog({
  open,
  onOpenChange,
  organizationId,
  projectId,
  projectIri,
  existingMembers,
}: InviteProjectMemberDialogProps) {
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] =
    useState<OrganizationMember | null>(null);
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
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

    const fetchRoles = async () => {
      try {
        const response = await apiGet<{ member: ProjectRole[] }>(
          "/project_roles?pagination=false",
        );
        const fetchedRoles = response.data?.member || [];
        const filteredRoles = fetchedRoles.filter((r) => r.value !== "CREATOR");
        setRoles(filteredRoles);

        const memberRole = filteredRoles.find((r) => r.value === "MEMBER");
        if (memberRole) {
          setSelectedRole(memberRole["@id"]);
        }
      } catch (error) {
        console.error("Failed to fetch roles", error);
      }
    };

    fetchRoles();
  }, [open, organizationId, showError]);

  // Filter available members (not already in project)
  const availableMembers = useMemo(() => {
    const existingMemberIds = new Set(
      existingMembers.map((pm) => pm.member.id),
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
      const result = await inviteProjectMember(null, {
        organizationId,
        projectId,
        projectIri,
        memberIri: selectedMember.member["@id"],
        roleIri: selectedRole,
      });

      if (result.ok) {
        notify({
          type: "default",
          title: "Członek zaproszony",
          description: `${selectedMember.member.username || selectedMember.member.email} został dodany do projektu.`,
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
          <DialogTitle>Zaproś członka do projektu</DialogTitle>
          <DialogDescription>
            Wybierz członka organizacji, którego chcesz dodać do projektu
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
                ? "Wszyscy członkowie organizacji są już w projekcie"
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

        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">Rola</label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz rolę" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role["@id"]} value={role["@id"]}>
                  {role.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
