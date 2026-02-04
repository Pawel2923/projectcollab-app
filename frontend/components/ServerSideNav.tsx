import React from "react";

import type { GroupedChats } from "@/lib/types/api";

import { ExpandableSideNav } from "./ExpandableSideNav";
import type { NavigationItem } from "./SideNav/types";

interface ServerSideNavProps {
  contentId: string;
  contentType: "project" | "chat";
  navigationItems?: NavigationItem[];
  headerTitle?: string;
  headerAcronym?: string;
  groupedChats?: GroupedChats;
  directChatsExpanded?: boolean;
  groupChatsExpanded?: boolean;
  isSideNavExpanded?: boolean;
  organizationId?: string;
}

export function ServerSideNav({
  contentId,
  contentType,
  navigationItems,
  headerTitle,
  headerAcronym,
  groupedChats,
  directChatsExpanded,
  groupChatsExpanded,
  isSideNavExpanded,
  organizationId,
}: ServerSideNavProps) {
  return (
    <ExpandableSideNav
      initialIsExpanded={isSideNavExpanded}
      contentId={contentId}
      contentType={contentType}
      navigationItems={navigationItems}
      headerTitle={headerTitle}
      headerAcronym={headerAcronym}
      groupedChats={groupedChats}
      directChatsExpanded={directChatsExpanded}
      groupChatsExpanded={groupChatsExpanded}
      organizationId={organizationId}
    />
  );
}
