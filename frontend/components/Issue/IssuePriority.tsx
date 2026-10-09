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
        icon: <ChevronDown className="text-priority-low" size={iconSize} />,
        priorityClasses: "bg-priority-low-background text-priority-low",
      };
    case "medium":
      return {
        message: "Średni",
        icon: <Equal className="text-priority-medium" size={iconSize} />,
        priorityClasses: "bg-priority-medium-background text-priority-medium",
      };
    case "high":
      return {
        message: "Wysoki",
        icon: <ChevronUp className="text-priority-high" size={iconSize} />,
        priorityClasses: "bg-priority-high-background text-priority-high",
      };
    case "critical":
      return {
        message: "Krytyczny",
        icon: <ChevronsUp className="text-priority-critical" size={iconSize} />,
        priorityClasses:
          "bg-priority-critical-background text-priority-critical",
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
