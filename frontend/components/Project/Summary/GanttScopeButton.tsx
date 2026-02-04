import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GanttScopeButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label: string;
  scope: string;
  isActive: boolean;
  onClick: (scope: string) => void;
}

export function GanttScopeButton({
  label,
  scope,
  isActive,
  onClick,
  className,
  ...props
}: GanttScopeButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm text-muted-foreground  font-medium ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-light-hover dark:hover:bg-dark-hover hover:text-foreground active:scale-95 active:text-gray-400 dark:active:text-gray-600 duration-300",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        isActive ? "bg-light text-foreground" : "",
        className,
      )}
      onClick={() => onClick(scope)}
      {...props}
    >
      {label}
    </Button>
  );
}
