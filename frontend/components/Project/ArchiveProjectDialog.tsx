"use client";

import { redirect } from "next/navigation";
import React from "react";

import deleteProject from "@/actions/project/deleteProject";
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

interface ArchiveProjectDialogProps {
  projectId?: string | number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArchiveProjectDialog({
  projectId,
  open,
  onOpenChange,
}: ArchiveProjectDialogProps) {
  const orgCtx = useOrganization();

  const actionClickHandler = async () => {
    await deleteProject(projectId);

    redirect(`/organizations/${orgCtx?.organizationId}/projects`);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Zarchiwizuj projekt</AlertDialogTitle>
        <AlertDialogDescription>
          Czy na pewno chcesz zarchiwizować ten projekt? Zarchiwizowany projekt nie
          będzie dostępny dla użytkowników.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={actionClickHandler}>
              Zarchiwizuj
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
