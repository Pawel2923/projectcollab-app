"use client";

import { ChevronDown, ChevronsUp, ChevronUp, Equal } from "lucide-react";
import React, { useEffect, useState } from "react";

interface IssuePriorityProps {
  priority: string | undefined;
  iconSize?: number;
  showIcon?: boolean;
  asBlock?: boolean;
}

export function IssuePriority({
  priority,
  iconSize = 16,
  showIcon = true,
  asBlock = false,
  ...rest
}: IssuePriorityProps & React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
  const [message, setMessage] = useState("Nieznany");
  const [icon, setIcon] = useState<React.ReactNode>(null);
  const [priorityClasses, setPriorityClasses] = useState(
    "bg-muted text-muted-foreground",
  );

  useEffect(() => {
    switch (priority) {
      case "low":
        setMessage("Niski");
        setIcon(<ChevronDown className="text-priority-low" size={iconSize} />);
        setPriorityClasses("bg-priority-low-background text-priority-low");
        break;
      case "medium":
        setMessage("Średni");
        setIcon(<Equal className="text-priority-medium" size={iconSize} />);
        setPriorityClasses(
          "bg-priority-medium-background text-priority-medium",
        );
        break;
      case "high":
        setMessage("Wysoki");
        setIcon(<ChevronUp className="text-priority-high" size={iconSize} />);
        setPriorityClasses("bg-priority-high-background text-priority-high");
        break;
      case "critical":
        setMessage("Krytyczny");
        setIcon(
          <ChevronsUp className="text-priority-critical" size={iconSize} />,
        );
        setPriorityClasses(
          "bg-priority-critical-background text-priority-critical",
        );
        break;
    }
  }, [priority, iconSize]);

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
