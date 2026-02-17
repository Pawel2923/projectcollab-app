"use client";

import React, { useEffect, useMemo, useState } from "react";

import { setSideNavExpanded } from "@/services/ui/side-nav-cookie-manager";
import { useOrganization } from "@/store/OrganizationContext";
import type { GroupedChats } from "@/types/ui/grouped-chats";
import type { NavigationItem } from "@/types/ui/navigation-item";

import { SideNav } from "./SideNav";
import { MobileSideNav } from "./SideNav/MobileSideNav";
import {
  SideNavDataProvider,
  SideNavStateProvider,
} from "./SideNav/SideNavContext";

interface ExpandableSideNavProps {
  initialIsExpanded?: boolean;
  contentId: string;
  contentType: "project" | "chat";
  navigationItems?: NavigationItem[];
  headerTitle?: string;
  headerAcronym?: string;
  groupedChats?: GroupedChats;
  directChatsExpanded?: boolean;
  groupChatsExpanded?: boolean;
  organizationId?: string;
}

export function ExpandableSideNav({
  initialIsExpanded = true,
  contentId,
  contentType,
  navigationItems,
  headerTitle,
  headerAcronym,
  groupedChats,
  directChatsExpanded,
  groupChatsExpanded,
  organizationId,
}: ExpandableSideNavProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(initialIsExpanded);
  const organization = useOrganization();
  const resolvedOrganizationId = useMemo(
    () => organizationId || organization?.organizationId,
    [organizationId, organization],
  );

  useEffect(() => {
    setSideNavExpanded(isExpanded);
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <SideNavDataProvider
      contentId={contentId}
      contentType={contentType}
      organizationId={resolvedOrganizationId}
      headerTitle={headerTitle}
      headerAcronym={headerAcronym}
    >
      <SideNavStateProvider isExpanded={isExpanded}>
        <MobileSideNav
          navigationItems={navigationItems}
          groupedChats={groupedChats}
          organizationId={resolvedOrganizationId}
        />
        <SideNav
          expandButtonClickHandler={toggleExpand}
          navigationItems={navigationItems}
          groupedChats={groupedChats}
          directChatsExpanded={directChatsExpanded}
          groupChatsExpanded={groupChatsExpanded}
        />
      </SideNavStateProvider>
    </SideNavDataProvider>
  );
}
