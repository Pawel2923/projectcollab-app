"use client";

import React from "react";

import deleteOrganization from "@/actions/organization/deleteOrganization";
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

interface DeleteOrganizationDialogProps {
  organizationId?: string | number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteOrganizationDialog({
  organizationId,
  open,
  onOpenChange,
}: DeleteOrganizationDialogProps) {
  const actionClickHandler = async () => {
    await deleteOrganization(organizationId);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Usuń organizację</AlertDialogTitle>
        <AlertDialogDescription>
          Po usunięciu organizacji wszystkie projekty, czaty oraz zadania
          zostaną usunięte.
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
