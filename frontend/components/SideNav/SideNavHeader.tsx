import React from "react";

import { useTextAnimation } from "@/hooks/useTextAnimation";

import { Avatar } from "../Avatar";

interface SideNavHeaderProps {
  isExpanded: boolean;
  projectName?: string;
  projectAcronym?: string;
}

export function SideNavHeader({
  isExpanded,
  projectName = "DemoProject",
  projectAcronym = "D",
}: SideNavHeaderProps) {
  const titleAnimation = useTextAnimation(isExpanded);

  return (
    <header
      className={`flex items-center border-b border-border min-h-15 transition-all duration-300 ${
        isExpanded ? "py-4 px-3 gap-1.5" : "py-4 px-2 justify-center"
      }`}
    >
      <div className="shrink-0">
        <Avatar initials={projectAcronym} size="medium" isCircle={false} />
      </div>
      <h1 className={titleAnimation}>{projectName}</h1>
    </header>
  );
}
