import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import React from "react";

import { formatEstimatedTime, formatTimestamp } from "@/services/issue/issue-date-time-service";
import type { Issue } from "@/types/api/issue";

import { AssigneeAvatar } from "../AssigneeAvatar";
import { IssuePriority } from "../Issue/IssuePriority";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface KanbanIssueProps {
  data: Issue;
}

export function KanbanIssue({ data }: KanbanIssueProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: data["@id"],
    });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    pointerEvents: isDragging ? "none" : undefined,
    cursor: isDragging ? "grabbing" : undefined,
    zIndex: isDragging ? 1000 : undefined,
  };

  const assignClickHandler = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <Link
      href={`issues/${data.id}`}
      className="flex flex-col gap-4 bg-light hover:bg-light-hover transition-colors border-l-4 border-primary p-2 rounded-xl w-full"
      style={style}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <div className="flex gap-4">
        <span className="text-dark-primary">{data.key}</span>
        <span className="font-semibold">{data.title}</span>
      </div>
      <div className="flex gap-auto justify-between">
        <div className="text-xs flex gap-1.5 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex gap-1 items-center">
                <IssuePriority priority={data.priority} iconSize={12} />
              </div>
            </TooltipTrigger>
            <TooltipContent>Priorytet</TooltipContent>
          </Tooltip>
          {data.estimated !== undefined && data.estimated > 0 && (
            <>
              <span>|</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{formatEstimatedTime(data.estimated)}</span>
                </TooltipTrigger>
                <TooltipContent>Oszacowany czas</TooltipContent>
              </Tooltip>
            </>
          )}
          {data.endDate && (
            <>
              <span>|</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>do {formatTimestamp(data.endDate)}</span>
                </TooltipTrigger>
                <TooltipContent>Termin wykonania zadania</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
        <div
          className="flex gap-0.5 cursor-default"
          onClick={assignClickHandler}
        >
          {data.assignees.length > 0 &&
            data.assignees.map((assignee, id) => (
              <AssigneeAvatar
                userIri={assignee["@id"]}
                size="small"
                ariaLabel={assignee.username || assignee.email}
                key={id}
              />
            ))}
        </div>
      </div>
    </Link>
  );
}
