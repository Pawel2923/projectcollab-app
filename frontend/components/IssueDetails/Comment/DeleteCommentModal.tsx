import React from "react";

import deleteComment from "@/actions/issue/deleteComments";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";

interface DeleteCommentModalProps {
  children: React.ReactElement<typeof Button>;
  commentIri: string;
  onCommentDeleted?: () => void;
}

export function DeleteCommentModal({
  children,
  commentIri,
  onCommentDeleted,
}: DeleteCommentModalProps) {
  const deleteHandler = async () => {
    const res = await deleteComment(commentIri);

    if (res.ok) {
      onCommentDeleted?.();
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Usuń komentarz</AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz usunąć ten komentarz?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={deleteHandler} asChild>
            <Button variant="destructive">Usuń</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
