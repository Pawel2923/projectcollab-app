"use client";

import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

import deleteProjectMember from "@/actions/project/deleteProjectMember";
import { useAlert } from "@/hooks/useAlert";
import { useEntityRole } from "@/hooks/useEntityRole";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import {
  clientApiCall,
  clientApiGet,
} from "@/services/fetch/client-api-service";
import { hasPermission } from "@/services/permissions/permissions-service";
import type { Collection } from "@/types/api/collection";
import type { Project, ProjectMember } from "@/types/api/project";
import type { ProjectRole } from "@/types/permissions/roles";
import { isOk } from "@/utils/result";

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
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import ProjectMembersTable from "./ProjectMembersTable";

interface ProjectSettingsContentProps {
  project: Project;
  initialMembers: ProjectMember[];
  currentUserId: string;
  organizationId: string;
  projectId: string;
}

const AVAILABLE_ROLES: ProjectRole[] = [
  "CREATOR",
  "ADMIN",
  "PRODUCT_OWNER",
  "SCRUM_MASTER",
  "DEVELOPER",
  "VIEWER",
];

export default function ProjectSettingsContent({
  project,
  initialMembers,
  currentUserId,
  organizationId,
  projectId,
}: ProjectSettingsContentProps) {
  const [members, setMembers] = useState<ProjectMember[]>(initialMembers);
  const [memberToDelete, setMemberToDelete] = useState<ProjectMember | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { showError, showSuccess } = useErrorHandler();
  const { notify } = useAlert();
  const { role: currentUserRole } = useEntityRole("project", projectId);

  const canDeleteMembers =
    currentUserRole &&
    (hasPermission(currentUserRole, "ADMIN") ||
      hasPermission(currentUserRole, "PRODUCT_OWNER") ||
      hasPermission(currentUserRole, "SCRUM_MASTER"));

  const canDeleteProject =
    currentUserRole &&
    (hasPermission(currentUserRole, "ADMIN") ||
      hasPermission(currentUserRole, "PRODUCT_OWNER"));

  // Refetch members when they change
  const refetchMembers = async (): Promise<void> => {
    const result = await clientApiGet<Collection<ProjectMember>>(
      `/project_members?projectId=${projectId}&pagination=false`,
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
    newRole: ProjectRole,
  ): Promise<void> => {
    try {
      // Fetch available roles to get the IRI for the new role
      const rolesResponse = await clientApiGet<{
        member: { "@id": string; value: string }[];
      }>(`/project_roles?pagination=false`);

      if (!isOk(rolesResponse)) {
        showError("Nie udało się pobrać dostępnych ról");
        return;
      }

      const roleIri = rolesResponse.value.member?.find(
        (r) => r.value === newRole,
      )?.["@id"];
      if (!roleIri) {
        showError("Nie znaleziono roli");
        return;
      }

      // Make the API call directly using clientApiCall which handles auth via proxy
      const response = await clientApiCall(`/project_members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
        },
        body: { role: roleIri },
      });

      if (!isOk(response)) {
        showError("Nie udało się zaktualizować roli członka");
        return;
      }

      showSuccess("Rola członka została zaktualizowana");
      await refetchMembers();
    } catch (error) {
      showError(error);
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
      const result = await deleteProjectMember(null, {
        memberId: memberToDelete.id,
        organizationId,
        projectId,
      });

      if (result.ok) {
        notify({
          type: "default",
          title: "Członek usunięty",
          description: `${memberToDelete.member.username || memberToDelete.member.email} został usunięty z projektu.`,
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
    topics: [`/project_members?projectId=${projectId}`],
    onUpdate: async () => {
      await refetchMembers();
    },
  });

  return (
    <>
      <div className="container">
        <Tabs defaultValue="members" className="w-full">
          <TabsList>
            <TabsTrigger value="members">Członkowie</TabsTrigger>
            <TabsTrigger value="general">Ogólne</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Członkowie projektu</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Zarządzaj rolami i uprawnieniami członków projektu
              </p>
            </div>

            <ProjectMembersTable
              members={members}
              onRoleChange={handleRoleChange}
              onDelete={canDeleteMembers ? handleDeleteMember : undefined}
              currentUserId={currentUserId}
              availableRoles={AVAILABLE_ROLES}
            />
          </TabsContent>

          <TabsContent value="general" className="mt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Informacje o projekcie
                </h2>
                <div className="bg-background border border-border rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Nazwa projektu
                    </span>
                    <p className="text-base">{project.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Status
                    </span>
                    <p className="text-base">
                      {project.isArchived ? "Zarchiwizowany" : "Aktywny"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {canDeleteProject && !project.isArchived && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-destructive mb-2">
                  Strefa niebezpieczna
                </h3>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-destructive">
                      Usuń projekt
                    </h4>
                    <p className="text-sm text-destructive/80">
                      Projekt zostanie usunięty i nie będzie dostępny dla
                      użytkowników.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Usuń projekt
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
              zostanie usunięty z projektu i utraci dostęp do wszystkich zadań.
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

      <DeleteProjectDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        projectId={projectId}
      />
    </>
  );
}
