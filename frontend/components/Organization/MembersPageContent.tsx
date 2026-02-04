"use client";

import React, { useEffect, useState } from "react";

import deleteOrganizationMember from "@/actions/deleteOrganizationMember";
import updateOrganizationMemberRole from "@/actions/updateOrganizationMemberRole";
import MembersTable from "@/components/permissions/MembersTable";
import { useAlert } from "@/hooks/useAlert";
import { useEntityRole } from "@/hooks/useEntityRole";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import type { OrganizationRole } from "@/lib/constants/roleHierarchy";
import type { Collection, OrganizationMember } from "@/lib/types/api";
import { isOk } from "@/lib/types/result";
import { clientApiGet } from "@/lib/utils/clientApiClient";
import { hasPermission } from "@/lib/utils/permissions";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface MembersPageContentProps {
  initialMembers: OrganizationMember[];
  currentUserId: number;
  organizationId: string;
}

const AVAILABLE_ROLES: OrganizationRole[] = ["CREATOR", "ADMIN", "MEMBER"];

export default function MembersPageContent({
  initialMembers,
  currentUserId,
  organizationId,
}: MembersPageContentProps) {
  const [members, setMembers] = useState<OrganizationMember[]>(initialMembers);
  const [memberToDelete, setMemberToDelete] =
    useState<OrganizationMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showError, showSuccess } = useErrorHandler();
  const { notify } = useAlert();
  const { role: currentUserRole } = useEntityRole(
    "organization",
    organizationId,
  );

  const canDeleteMembers =
    currentUserRole && hasPermission(currentUserRole, "MODERATOR");

  const refetchMembers = async (): Promise<void> => {
    const result = await clientApiGet<Collection<OrganizationMember>>(
      `/organization_members?organizationId=${organizationId}`,
    );

    if (isOk(result)) {
      setMembers(result.value.member || []);
    } else {
      showError(result.error, {
        customMessage: "Nie udało się odświeżyć listy członków",
      });
    }
  };

  const handleRoleChange = async (
    memberId: number,
    newRole: OrganizationRole,
  ): Promise<void> => {
    const result = await updateOrganizationMemberRole(null, {
      memberId,
      role: newRole,
    });

    if (result.ok) {
      showSuccess("Rola członka została zaktualizowana");
      await refetchMembers();
    } else {
      showError(result, {
        customMessage: "Nie udało się zaktualizować roli członka",
      });
    }
  };

  const handleBulkRoleChange = async (
    memberIds: number[],
    newRole: OrganizationRole,
  ): Promise<void> => {
    const results = await Promise.allSettled(
      memberIds.map((id) =>
        updateOrganizationMemberRole(null, { memberId: id, role: newRole }),
      ),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (succeeded > 0) {
      showSuccess(
        `Zaktualizowano ${succeeded} ${succeeded === 1 ? "członka" : "członków"}`,
      );
      await refetchMembers();
    }

    if (failed > 0) {
      showError(
        `Nie udało się zaktualizować ${failed} ${failed === 1 ? "członka" : "członków"}`,
      );
    }
  };

  const handleDeleteMember = async (memberId: number): Promise<void> => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setMemberToDelete(member);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!memberToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteOrganizationMember(null, {
        memberId: memberToDelete.id,
        organizationId,
      });

      if (result.ok) {
        notify({
          type: "default",
          title: "Członek usunięty",
          description: `${memberToDelete.member.username || memberToDelete.member.email} został usunięty z organizacji.`,
          duration: 4000,
          hasCloseButton: true,
          icon: "check",
        });
        await refetchMembers();
        setMemberToDelete(null);
      } else {
        notify({
          type: "destructive",
          title: "Błąd",
          description: result.message || "Nie udało się usunąć członka",
          duration: 5000,
          hasCloseButton: true,
        });
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  useMercureObserver({
    topics: [`/organization_members?organizationId=${organizationId}`],
    onUpdate: async () => {
      await refetchMembers();
    },
  });

  return (
    <>
      <div className="space-y-6">
        <MembersTable
          members={members}
          onRoleChange={handleRoleChange}
          onBulkRoleChange={handleBulkRoleChange}
          onDelete={canDeleteMembers ? handleDeleteMember : undefined}
          currentUserId={currentUserId}
          availableRoles={AVAILABLE_ROLES}
        />
      </div>

      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={() => !isDeleting && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Czy na pewno chcesz usunąć członka?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Użytkownik{" "}
              <span className="font-semibold">
                {memberToDelete?.member.username ||
                  memberToDelete?.member.email}
              </span>{" "}
              zostanie usunięty z organizacji i utraci dostęp do wszystkich
              projektów.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Usuwanie..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
