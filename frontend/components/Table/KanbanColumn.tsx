import { useDroppable } from "@dnd-kit/core";
import { Inbox } from "lucide-react";
import React from "react";

import type { Collection, Issue } from "@/lib/types/api";
import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { KanbanIssue } from "./KanbanIssue";

interface KanbanColumnProps {
  issues: Collection<Issue> | null;
  title: string;
  statusIri: string;
}

export function KanbanColumn({ title, issues, statusIri }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: statusIri });

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border",
        isOver ? "bg-tertiary" : "bg-background",
      )}
      ref={setNodeRef}
    >
      <div className="min-h-14 flex items-center justify-between bg-gray-200 p-2 border-b border-border rounded-t-lg">
        <span className="font-semibold">{title}</span>
        {issues?.totalItems !== undefined && issues.totalItems > 0 && (
          <IssueNumberBadge number={issues.totalItems} />
        )}
      </div>
      <div className="flex flex-col gap-4 px-2 pb-4 h-full">
        {issues?.totalItems === 0 ? (
          <div className="grid gap-2 p-2 justify-items-center font-semibold text-disabled">
            <Inbox /> Brak zadań
          </div>
        ) : (
          issues?.member.map((issue) => (
            <KanbanIssue key={issue.id} data={issue} />
          ))
        )}
      </div>
    </div>
  );
}

function IssueNumberBadge({ number }: { number: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="bg-gray-300 rounded-lg p-2 w-7 h-7 flex items-center justify-center text-sm"
          aria-label={`Liczba zadań: ${number}`}
        >
          {number}
        </div>
      </TooltipTrigger>
      <TooltipContent>Liczba zadań</TooltipContent>
    </Tooltip>
  );
}
