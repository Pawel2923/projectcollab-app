"use client";

import React from "react";

import deleteSprint from "@/actions/sprint/deleteSprint";
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
import { useAlert } from "@/hooks/useAlert";

interface DeleteSprintDialogProps {
  sprintId: string | number;
  projectId: string | number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSprintDialog({
  sprintId,
  projectId,
  open,
  onOpenChange,
}: DeleteSprintDialogProps) {
  const { notify } = useAlert();

  const actionClickHandler = async () => {
    const result = await deleteSprint(sprintId, projectId);

    if (result.ok) {
      notify({
        type: "default",
        title: "Sprint usunięty",
      });
      onOpenChange(false);
    } else {
      notify({
        type: "destructive",
        title: "Błąd usuwania sprintu",
        description: result.message,
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Usuń sprint</AlertDialogTitle>
        <AlertDialogDescription>
          Czy na pewno chcesz usunąć ten sprint?
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
