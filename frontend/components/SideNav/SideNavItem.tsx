import React from "react";

import { useTextAnimation } from "@/hooks/useTextAnimation";

import { ActiveNavigationButton } from "../ActiveNavigationButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface SideNavItemProps {
  href: string;
  icon: React.ComponentType | React.ReactNode;
  label: string;
  delay?: string;
  isExpanded: boolean;
}

export function SideNavItem({
  href,
  icon,
  label,
  delay,
  isExpanded,
}: SideNavItemProps) {
  const labelAnimation = useTextAnimation(isExpanded, delay);

  const IconComponent =
    typeof icon === "function" ? (icon as React.ComponentType) : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ActiveNavigationButton href={href} isCollapsed={!isExpanded}>
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            {IconComponent ? <IconComponent /> : (icon as React.ReactNode)}
          </div>
          <span className={labelAnimation}>{label}</span>
        </ActiveNavigationButton>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
