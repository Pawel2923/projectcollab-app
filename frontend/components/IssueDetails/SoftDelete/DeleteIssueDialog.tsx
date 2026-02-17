import { redirect } from "next/navigation";
import React from "react";

import deleteIssue from "@/actions/issue/deleteIssue";
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

interface IssueSoftDeleteDialogProps {
  projectId?: number | string;
  issueId?: number | string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteIssueDialog({
  projectId,
  issueId,
  open,
  onOpenChange,
}: IssueSoftDeleteDialogProps) {
  const orgCtx = useOrganization();

  const actionClickHandler = async () => {
    const path = `/organizations/${orgCtx?.organizationId}/projects/${projectId ?? ""}`;
    await deleteIssue(issueId, path);

    redirect(path);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Usuń zadanie</AlertDialogTitle>
        <AlertDialogDescription>
          Czy na pewno chcesz usunąć te zadanie? Zdanie, komentarze oraz
          załączniki zostaną usunięte. Załączników nie będzie można odzyskać.
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
