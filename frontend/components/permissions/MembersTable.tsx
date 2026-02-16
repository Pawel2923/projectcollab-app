"use client";

import { Loader2, Trash2 } from "lucide-react";
import React, { useState } from "react";

import { AssigneeAvatar } from "@/components/AssigneeAvatar";
import RoleSelector from "@/components/permissions/RoleSelector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrganizationRole } from "@/constants/roleHierarchy";
import { formatDateTime } from "@/lib/utils/issueUtils";
import type { OrganizationMember } from "@/types/api/organization";

interface MembersTableProps {
  members: OrganizationMember[];
  onRoleChange: (memberId: number, newRole: OrganizationRole) => Promise<void>;
  onBulkRoleChange: (
    memberIds: number[],
    newRole: OrganizationRole,
  ) => Promise<void>;
  onDelete?: (memberId: number) => Promise<void>;
  currentUserId: number;
  availableRoles: OrganizationRole[];
}

export default function MembersTable({
  members,
  onRoleChange,
  onBulkRoleChange,
  onDelete,
  currentUserId,
  availableRoles,
}: MembersTableProps) {
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(
    new Set(),
  );
  const [updatingMembers, setUpdatingMembers] = useState<Set<number>>(
    new Set(),
  );
  const [bulkUpdateRole, setBulkUpdateRole] = useState<OrganizationRole | null>(
    null,
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

  const handleSingleRoleChange = async (
    memberId: number,
    newRole: OrganizationRole,
  ) => {
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

  const handleBulkRoleChange = async () => {
    if (!bulkUpdateRole || selectedMembers.size === 0) return;

    const memberIds = Array.from(selectedMembers);
    setUpdatingMembers(new Set([...updatingMembers, ...memberIds]));
    try {
      await onBulkRoleChange(memberIds, bulkUpdateRole);
      setSelectedMembers(new Set());
      setBulkUpdateRole(null);
    } finally {
      setUpdatingMembers((prev) => {
        const next = new Set(prev);
        memberIds.forEach((id) => next.delete(id));
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
      {selectedMembers.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg">
          <span className="text-sm font-medium">
            Zaznaczono {selectedMembers.size}{" "}
            {selectedMembers.size === 1
              ? "członka"
              : selectedMembers.size < 5
                ? "członków"
                : "członków"}
          </span>
          <RoleSelector
            value={bulkUpdateRole || "MEMBER"}
            onChange={setBulkUpdateRole}
            availableRoles={availableRoles.filter((role) => role !== "CREATOR")}
          />
          <Button onClick={handleBulkRoleChange} disabled={!bulkUpdateRole}>
            Zaktualizuj zaznaczone
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedMembers(new Set())}
          >
            Wyczyść zaznaczenie
          </Button>
        </div>
      )}

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
            const isCurrentUser = member.member.id === currentUserId;

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
                    <RoleSelector
                      value={member.role.value as OrganizationRole}
                      onChange={(newRole) =>
                        handleSingleRoleChange(member.id, newRole)
                      }
                      disabled={isCreator || isUpdating}
                      availableRoles={
                        isCreator
                          ? ["CREATOR"]
                          : availableRoles.filter((role) => role !== "CREATOR")
                      }
                    />
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
