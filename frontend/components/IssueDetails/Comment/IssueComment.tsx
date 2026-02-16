import { Trash2 } from "lucide-react";
import React from "react";

import { getUserInitials } from "@/lib/utils/userUtils";
import { formatDateTime } from "@/services/issue/issue-date-time-service";
import type { IssueComment } from "@/types/api/issue-metadata";

import { Avatar } from "../../Avatar";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { DeleteCommentModal } from "./DeleteCommentModal";
import { EditCommentButton } from "./EditCommentButton";

interface IssueCommentProps {
  comment: IssueComment;
  setIsEditing: (isEditing: boolean) => void;
  onCommentUpdated?: () => void;
}

export function IssueComment({
  comment,
  setIsEditing,
  onCommentUpdated,
}: IssueCommentProps) {
  return (
    <li
      key={comment["@id"] || comment.id}
      className="rounded-lg border border-border bg-muted/30 p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <Avatar initials={getUserInitials(comment.commenter)} size="medium" />
          <p>
            {comment.commenter?.username ||
              comment.commenter?.email ||
              "Nieznany użytkownik"}
          </p>
        </div>
        <div>
          <EditCommentButton setIsEditing={setIsEditing} />
          <DeleteCommentModal
            commentIri={comment["@id"]}
            onCommentDeleted={onCommentUpdated}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="circular"
                  aria-label="Usuń komentarz"
                  className="hover:text-destructive active:text-destructive"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Usuń komentarz</TooltipContent>
            </Tooltip>
          </DeleteCommentModal>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {comment.content || "Brak treści komentarza"}
      </p>
      <div>
        {comment.createdAt && (
          <span className="mt-2 text-xs text-muted-foreground/70">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{formatDateTime(comment.createdAt)}</span>
              </TooltipTrigger>
              <TooltipContent>
                {`Utworzono: ${formatDateTime(comment.createdAt)}`}
              </TooltipContent>
            </Tooltip>
          </span>
        )}
        {comment.updatedAt && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="mt-2 ml-4 text-xs text-muted-foreground/70">
                (Edytowano)
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {`Ostatnia edycja: ${formatDateTime(comment.updatedAt)}`}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </li>
  );
}
