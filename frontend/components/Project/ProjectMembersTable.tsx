"use client";

import { Loader2, Trash2 } from "lucide-react";
import React, { useState } from "react";

import { AssigneeAvatar } from "@/components/AssigneeAvatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProjectRole } from "@/lib/constants/roleHierarchy";
import { formatDateTime } from "@/lib/utils/issueUtils";
import type { ProjectMember } from "@/types/api/project";

interface ProjectMembersTableProps {
  members: ProjectMember[];
  onRoleChange: (memberId: number, newRole: ProjectRole) => Promise<void>;
  onDelete?: (memberId: number) => Promise<void>;
  currentUserId: string;
  availableRoles: ProjectRole[];
}

export default function ProjectMembersTable({
  members,
  onRoleChange,
  onDelete,
  currentUserId,
  availableRoles,
}: ProjectMembersTableProps) {
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(
    new Set(),
  );
  const [updatingMembers, setUpdatingMembers] = useState<Set<number>>(
    new Set(),
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = members
        .filter((member) => member.role.value !== "CREATOR")
        .map((member) => member.id);
      setSelectedMembers(new Set(selectableIds));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleSelectMember = (memberId: number, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
    } else {
      newSelected.delete(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleRoleChange = async (memberId: number, newRole: ProjectRole) => {
    setUpdatingMembers(new Set(updatingMembers).add(memberId));
    try {
      await onRoleChange(memberId, newRole);
    } finally {
      setUpdatingMembers((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    }
  };

  const handleDelete = async (memberId: number) => {
    if (!onDelete) return;
    setUpdatingMembers(new Set(updatingMembers).add(memberId));
    try {
      await onDelete(memberId);
    } finally {
      setUpdatingMembers((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    }
  };

  const selectableMembers = members.filter(
    (member) => member.role.value !== "CREATOR",
  );
  const allSelectableSelected =
    selectableMembers.length > 0 &&
    selectableMembers.every((member) => selectedMembers.has(member.id));

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelectableSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Zaznacz wszystkich członków"
              />
            </TableHead>
            <TableHead>Członek</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rola</TableHead>
            <TableHead>Dołączono</TableHead>
            {onDelete && <TableHead className="w-12"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isCreator = member.role.value === "CREATOR";
            const isUpdating = updatingMembers.has(member.id);
            const isCurrentUser = member.member.id === Number(currentUserId);

            return (
              <TableRow key={member.id}>
                <TableCell>
                  {!isCreator && (
                    <Checkbox
                      checked={selectedMembers.has(member.id)}
                      onCheckedChange={(checked) =>
                        handleSelectMember(member.id, checked as boolean)
                      }
                      disabled={isUpdating}
                      aria-label={`Select ${member.member.username || member.member.email}`}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <AssigneeAvatar
                      userIri={member.member["@id"]}
                      size="small"
                    />
                    <span>
                      {member.member.username || member.member.email}
                      {isCurrentUser && " (Ty)"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{member.member.email}</TableCell>
                <TableCell>
                  {isUpdating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Aktualizacja...
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={member.role.value}
                      onValueChange={(value) =>
                        handleRoleChange(member.id, value as ProjectRole)
                      }
                      disabled={isCreator || isUpdating}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(isCreator
                          ? ["CREATOR"]
                          : availableRoles.filter((r) => r !== "CREATOR")
                        ).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  <span suppressHydrationWarning>
                    {formatDateTime(member.joinedAt, true)}
                  </span>
                </TableCell>
                {onDelete && (
                  <TableCell>
                    {!isCreator && !isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(member.id)}
                        disabled={isUpdating}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
