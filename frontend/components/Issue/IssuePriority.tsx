"use client";

import { ChevronDown, ChevronsUp, ChevronUp, Equal } from "lucide-react";
import React from "react";

interface IssuePriorityProps {
  priority: string | undefined;
  iconSize?: number;
  showIcon?: boolean;
  asBlock?: boolean;
}

function getPriorityData(
  priority: string | undefined,
  iconSize: number,
): {
  message: string;
  icon: React.ReactNode;
  priorityClasses: string;
} {
  switch (priority) {
    case "low":
      return {
        message: "Niski",
        icon: (
          <ChevronDown
            className="text-priority-low-foreground"
            size={iconSize}
          />
        ),
        priorityClasses: "bg-priority-low text-priority-low-foreground",
      };
    case "medium":
      return {
        message: "Średni",
        icon: (
          <Equal className="text-priority-medium-foreground" size={iconSize} />
        ),
        priorityClasses: "bg-priority-medium text-priority-medium-foreground",
      };
    case "high":
      return {
        message: "Wysoki",
        icon: (
          <ChevronUp
            className="text-priority-high-foreground"
            size={iconSize}
          />
        ),
        priorityClasses: "bg-priority-high text-priority-high-foreground",
      };
    case "critical":
      return {
        message: "Krytyczny",
        icon: (
          <ChevronsUp
            className="text-priority-critical-foreground"
            size={iconSize}
          />
        ),
        priorityClasses:
          "bg-priority-critical text-priority-critical-foreground",
      };
    default:
      return {
        message: "Nieznany",
        icon: null,
        priorityClasses: "bg-muted text-muted-foreground",
      };
  }
}

export function IssuePriority({
  priority,
  iconSize = 16,
  showIcon = true,
  asBlock = false,
  ...rest
}: IssuePriorityProps & React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
  const { message, icon, priorityClasses } = getPriorityData(
    priority,
    iconSize,
  );

  return asBlock ? (
    <div
      className={`flex items-center gap-1 ${priorityClasses} px-2 py-1 rounded-full text-xs uppercase tracking-wide`}
      {...rest}
    >
      {showIcon && icon}
      <span>{message} </span>
    </div>
  ) : (
    <>
      {showIcon && icon}
      <span>{message} </span>
    </>
  );
}
