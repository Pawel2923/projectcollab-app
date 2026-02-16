import React from "react";

import { ChevronsLeftIcon } from "@/assets/icons/ChevronsLeftIcon";
import { classNamesMerger } from "@/utils/class-names-merger";

import { useTextAnimation } from "../../hooks/useTextAnimation";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface CollapseButtonProps {
  isExpanded: boolean;
  onClick?: () => void;
  label?: string;
}

export function CollapseButton({
  isExpanded,
  onClick,
  label = "Zwiń menu",
}: CollapseButtonProps) {
  const labelAnimation = useTextAnimation(isExpanded);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          className={classNamesMerger(
            "flex items-center justify-center border-t border-sidebar-border text-sm font-semibold rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground min-h-[44px]",
            isExpanded ? "gap-1.5 py-1.5" : "!gap-0 !py-0",
          )}
          variant="ghost"
          aria-label={isExpanded ? "Zwiń menu" : "Rozwiń menu"}
        >
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            <ChevronsLeftIcon
              className={classNamesMerger(
                "inline-block transition-transform duration-300 ease-in-out",
                isExpanded ? "" : "rotate-180",
              )}
            />
          </div>
          <span className={labelAnimation}>{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isExpanded ? "Zwiń menu" : "Rozwiń menu"}
      </TooltipContent>
    </Tooltip>
  );
}
