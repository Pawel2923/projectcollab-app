"use client";

import { Pencil } from "lucide-react";
import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "../../ui/button";

interface EditCommentButtonProps {
  setIsEditing: (isEditing: boolean) => void;
}

export function EditCommentButton({ setIsEditing }: EditCommentButtonProps) {
  const clickHandler = () => {
    setIsEditing?.(true);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="circular"
          aria-label="Edytuj komentarz"
          onClick={clickHandler}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Edytuj komentarz</TooltipContent>
    </Tooltip>
  );
}
