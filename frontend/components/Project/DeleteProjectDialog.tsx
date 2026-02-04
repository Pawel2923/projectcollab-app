"use client";

import { redirect } from "next/navigation";
import React from "react";

import deleteProject from "@/actions/deleteProject";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/store/OrganizationContext";

interface DeleteProjectDialogProps {
  projectId?: string | number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({
  projectId,
  open,
  onOpenChange,
}: DeleteProjectDialogProps) {
  const orgCtx = useOrganization();

  const actionClickHandler = async () => {
    await deleteProject(projectId);

    redirect(`/organizations/${orgCtx?.organizationId}/projects`);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Usuń projekt</AlertDialogTitle>
        <AlertDialogDescription>
          Czy na pewno chcesz usunąć ten projekt?
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={actionClickHandler}>
              Usuń
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
