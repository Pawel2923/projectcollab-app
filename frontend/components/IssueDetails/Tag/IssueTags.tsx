import { PlusCircleIcon, XIcon } from "lucide-react";
import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { IssueTag } from "@/lib/types/api";

import { Label } from "../../ui/label";
import type { IssueDetails } from "../types";
import { AddIssueTagPopover } from "./AddIssueTagPopover";

interface IssueTagsProps {
  issue: IssueDetails;
}

type IssueTagInput = Omit<IssueTag, "@id" | "@type">;

type NewTag = {
  title: string;
  backgroundColor?: string;
  textColor?: string;
};

export function IssueTags({ issue }: IssueTagsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [issueTags, setIssueTags] = useState<IssueTagInput[]>(
    issue.issueTags || [],
  );
  const [newTags, setNewTags] = useState<NewTag[]>([]);

  const addClickHandler = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault();
    setIsPopoverOpen((open) => !open);
  };

  const popoverOpenChangeHandler = (open: boolean) => {
    setIsPopoverOpen(open);
  };

  const deleteTagHandler = (
    event: React.MouseEvent<HTMLButtonElement>,
    tagId: number,
  ) => {
    event.preventDefault();
    setIssueTags((prevTags) =>
      prevTags.filter((issueTag) => issueTag.tag.id !== tagId),
    );
  };

  const deleteNewTagHandler = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.preventDefault();
    setNewTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddNewTag = (tag: NewTag) => {
    setNewTags((prev) => [...prev, tag]);
    setIsPopoverOpen(false);
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label withoutControls>Etykiety</Label>

        <Popover open={isPopoverOpen} onOpenChange={popoverOpenChangeHandler}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  type="button"
                  onClick={addClickHandler}
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  <span className="sr-only">Dodaj etykietę</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Dodaj etykietę</TooltipContent>
          </Tooltip>
          <AddIssueTagPopover open={isPopoverOpen} onAddNew={handleAddNewTag} />
        </Popover>
      </div>

      <input
        type="hidden"
        name="tags"
        value={issueTags.map((issueTag) => issueTag.tag.id).join(",")}
      />

      {newTags.map((tag, index) => (
        <React.Fragment key={`new-tag-${index}`}>
          <input type="hidden" name="newTags[title]" value={tag.title} />
          <input
            type="hidden"
            name="newTags[backgroundColor]"
            value={tag.backgroundColor || ""}
          />
          <input
            type="hidden"
            name="newTags[textColor]"
            value={tag.textColor || ""}
          />
        </React.Fragment>
      ))}

      {issueTags.length > 0 || newTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {issueTags
            .filter((issueTag) => issueTag?.tag?.id)
            .map((issueTag) => (
              <Badge
                key={issueTag.tag.id}
                style={{
                  backgroundColor: issueTag.tag.backgroundColor,
                  color: issueTag.tag.textColor,
                }}
                className="pr-0"
              >
                {issueTag.tag.title || "Nieznana etykieta"}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-fit !px-0.5 ms-1 hover:text-destructive"
                      size="sm"
                      onClick={(event) =>
                        deleteTagHandler(event, issueTag.tag.id)
                      }
                    >
                      <XIcon size={16} aria-hidden={true} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Usuń etykietę</TooltipContent>
                </Tooltip>
              </Badge>
            ))}

          {newTags.map((tag, index) => (
            <Badge
              key={`new-${index}`}
              style={{
                backgroundColor: tag.backgroundColor,
                color: tag.textColor,
              }}
              className="pr-0"
            >
              {tag.title}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-fit !px-0.5 ms-1 hover:text-destructive"
                    size="sm"
                    onClick={(event) => deleteNewTagHandler(event, index)}
                  >
                    <XIcon size={16} aria-hidden={true} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Usuń etykietę (niezapisana)</TooltipContent>
              </Tooltip>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Brak przypisanych etykiet
        </p>
      )}
    </div>
  );
}
