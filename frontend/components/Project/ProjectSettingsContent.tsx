"use client";

import * as Form from "@radix-ui/react-form";
import { Loader2Icon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useState } from "react";

import deleteProjectMember from "@/actions/project/deleteProjectMember";
import updateProjectName from "@/actions/project/updateProjectName";
import { TypographyInvalid } from "@/components/typography/TypographyInvalid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormInput } from "@/components/ui/Form/FormInput";
import { useAlert } from "@/hooks/useAlert";
import { useEntityRole } from "@/hooks/useEntityRole";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import { useServerValidation } from "@/hooks/useServerValidation";
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
import { ArchiveProjectDialog } from "./ArchiveProjectDialog";
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
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const { showError, showSuccess } = useErrorHandler();
  const { notify } = useAlert();
  const { role: currentUserRole } = useEntityRole("project", projectId);

  const [state, formAction, isPending] = useActionState(
    updateProjectName,
    null,
  );
  const { serverErrors, clearServerErrors } = useServerValidation(
    ["name"] as const,
    state,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      notify({
        type: "default",
        title: "Nazwa zmieniona",
        description: "Pomyślnie zaktualizowano nazwę projektu.",
        duration: 4000,
        hasCloseButton: true,
        icon: "check",
      });
      router.refresh();
    }
  }, [state, notify, router]);

  const canDeleteMembers =
    currentUserRole &&
    (hasPermission(currentUserRole, "ADMIN") ||
      hasPermission(currentUserRole, "PRODUCT_OWNER") ||
      hasPermission(currentUserRole, "SCRUM_MASTER"));

  const canDeleteProject =
    currentUserRole &&
    (hasPermission(currentUserRole, "ADMIN") ||
      hasPermission(currentUserRole, "PRODUCT_OWNER"));

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
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">Ogólne</TabsTrigger>
            <TabsTrigger value="members">Członkowie</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card key={project.name} className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Zmień nazwę projektu</CardTitle>
                <CardDescription>
                  Zaktualizuj nazwę projektu, aby zmienić jej wyświetlanie w systemie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form.Root action={formAction} onSubmit={clearServerErrors}>
                  <input type="hidden" name="projectId" value={projectId} />

                  <div className="grid gap-6">
                    <FormInput
                      name="name"
                      label="Nowa nazwa projektu"
                      serverInvalid={serverErrors.name?.isInvalid || false}
                      serverMessage={serverErrors.name?.message}
                      valueMissingMessage="Nazwa projektu jest wymagana"
                      inputProps={{
                        defaultValue: project.name,
                        required: true,
                        disabled: isPending,
                        placeholder: "Wprowadź nową nazwę",
                      }}
                    />

                    {serverErrors.form?.isInvalid && (
                      <TypographyInvalid>{serverErrors.form.message}</TypographyInvalid>
                    )}

                    <Form.Submit asChild>
                      <Button type="submit" disabled={isPending} className="w-fit">
                        Zapisz zmiany
                        {isPending && <Loader2Icon className="animate-spin ml-2 h-4 w-4" />}
                      </Button>
                    </Form.Submit>
                  </div>
                </Form.Root>
              </CardContent>
            </Card>

            {canDeleteProject && !project.isArchived && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-destructive mb-2">
                  Strefa niebezpieczna
                </h3>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-destructive">
                      Zarchiwizuj projekt
                    </h4>
                    <p className="text-sm text-destructive/80">
                      Projekt zostanie zarchiwizowany i nie będzie dostępny dla
                      użytkowników.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowArchiveDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Zarchiwizuj projekt
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

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

      <ArchiveProjectDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        projectId={projectId}
      />
    </>
  );
}
