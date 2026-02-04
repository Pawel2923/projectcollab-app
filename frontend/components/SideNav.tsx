"use client";

import React from "react";

import type { GroupedChats } from "@/lib/types/api";

import { useSidebarClasses } from "../hooks/useSidebarClasses";
import { CollapseButton } from "./SideNav/CollapseButton";
import { useSideNavData, useSideNavState } from "./SideNav/SideNavContext";
import { SideNavHeader } from "./SideNav/SideNavHeader";
import { SideNavList } from "./SideNav/SideNavList";
import type { NavigationItem } from "./SideNav/types";

interface SideNavProps {
  expandButtonClickHandler?: () => void;
  navigationItems?: NavigationItem[];
  groupedChats?: GroupedChats;
  directChatsExpanded?: boolean;
  groupChatsExpanded?: boolean;
}

export function SideNav({
  expandButtonClickHandler,
  navigationItems,
  groupedChats,
  directChatsExpanded,
  groupChatsExpanded,
}: SideNavProps) {
  const { isExpanded } = useSideNavState();
  const { headerTitle, headerAcronym } = useSideNavData();
  const sidebarClasses = useSidebarClasses(isExpanded);

  return (
    <nav className={sidebarClasses}>
      {headerTitle && headerAcronym && (
        <SideNavHeader
          isExpanded={isExpanded}
          projectName={headerTitle}
          projectAcronym={headerAcronym}
        />
      )}
      <SideNavList
        isExpanded={isExpanded}
        navigationItems={navigationItems}
        groupedChats={groupedChats}
        directChatsExpanded={directChatsExpanded}
        groupChatsExpanded={groupChatsExpanded}
      />
      <CollapseButton
        isExpanded={isExpanded}
        onClick={expandButtonClickHandler}
      />
    </nav>
  );
}
