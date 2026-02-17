"use client";

import { EllipsisVertical, Trash2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import { DeleteOrganizationDialog } from "@/components/Organization/DeleteOrganizationDialog";
import { useEntityRole } from "@/hooks/useEntityRole";
import { hasPermission } from "@/services/permissions/permissions-service";
import type { OrganizationMember } from "@/types/api/organization";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { InviteOrganizationMemberDialog } from "./InviteOrganizationMemberDialog";

interface OrganizationCardMenuProps {
  organizationId: string;
  organizationIri: string;
  existingMembers: OrganizationMember[];
}

export function OrganizationCardMenu({
  organizationId,
  organizationIri,
  existingMembers,
}: OrganizationCardMenuProps) {
  const { role: currentUserRole } = useEntityRole(
    "organization",
    organizationId,
  );
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteOrganizationDialogOpen, setDeleteOrganizationDialogOpen] =
    useState(false);

  const canManageMembers =
    currentUserRole && hasPermission(currentUserRole, "ADMIN");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="circular" size="icon" className="h-8 w-8">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Zaproś członka
            </DropdownMenuItem>
            {canManageMembers && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/organizations/${organizationId}/members`}>
                    <Users className="h-4 w-4" />
                    Zarządzaj członkami
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteOrganizationDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Usuń organizację
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <InviteOrganizationMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        organizationId={organizationId}
        organizationIri={organizationIri}
        existingMembers={existingMembers}
      />

      {canManageMembers && (
        <DeleteOrganizationDialog
          organizationId={organizationId}
          open={deleteOrganizationDialogOpen}
          onOpenChange={setDeleteOrganizationDialogOpen}
        />
      )}
    </>
  );
}
