"use client";

import React, { useState } from "react";

import type { Comment } from "@/lib/types/api";

import { CommentEditForm } from "./CommentEditForm";
import { IssueComment } from "./IssueComment";

interface IssueCommentContainerProps {
  comment: Comment;
  onCommentUpdated?: () => void;
}

export function IssueCommentContainer({
  comment,
  onCommentUpdated,
}: IssueCommentContainerProps) {
  const [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <CommentEditForm
      comment={comment}
      setIsEditing={setIsEditing}
      onCommentUpdated={onCommentUpdated}
    />
  ) : (
    <IssueComment
      comment={comment}
      setIsEditing={setIsEditing}
      onCommentUpdated={onCommentUpdated}
    />
  );
}
