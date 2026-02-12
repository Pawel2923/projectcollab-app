"use client";

import { EllipsisVertical, Settings, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import { useEntityRole } from "@/hooks/useEntityRole";
import { hasPermission } from "@/lib/utils/permissions";
import type { ProjectMember } from "@/types/api/project";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { InviteProjectMemberDialog } from "./InviteProjectMemberDialog";

interface ProjectCardMenuProps {
  organizationId: string;
  projectId: string;
  projectIri: string;
  existingMembers: ProjectMember[];
}

export function ProjectCardMenu({
  organizationId,
  projectId,
  projectIri,
  existingMembers,
}: ProjectCardMenuProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { role: currentUserRole } = useEntityRole("project", projectId);

  const canManageMembers =
    currentUserRole &&
    (hasPermission(currentUserRole, "ADMIN") ||
      hasPermission(currentUserRole, "PRODUCT_OWNER") ||
      hasPermission(currentUserRole, "SCRUM_MASTER"));

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
            {canManageMembers && (
              <DropdownMenuItem onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Zaproś członka
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                href={`/organizations/${organizationId}/projects/${projectId}/settings`}
              >
                <Users className="h-4 w-4" />
                Zarządzaj członkami
              </Link>
            </DropdownMenuItem>
            {canManageMembers && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/organizations/${organizationId}/projects/${projectId}/settings`}
                >
                  <Settings className="h-4 w-4" />
                  Ustawienia
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {canManageMembers && (
        <InviteProjectMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          organizationId={organizationId}
          projectId={projectId}
          projectIri={projectIri}
          existingMembers={existingMembers}
        />
      )}
    </>
  );
}
