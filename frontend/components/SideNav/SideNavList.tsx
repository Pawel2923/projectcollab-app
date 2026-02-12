"use client";

import React from "react";

import { useOrganization } from "@/store/OrganizationContext";
import type { GroupedChats } from "@/types/ui/grouped-chats";
import type { NavigationItem } from "@/types/ui/navigation-item";

import { getNavigationItems } from "./constants";
import { useSideNavData } from "./SideNavContext";
import { SideNavItem } from "./SideNavItem";
import { SideNavSection } from "./SideNavSection";

interface SideNavListProps {
  isExpanded: boolean;
  navigationItems?: NavigationItem[];
  groupedChats?: GroupedChats;
  directChatsExpanded?: boolean;
  groupChatsExpanded?: boolean;
}

export function SideNavList({
  isExpanded,
  navigationItems: customNavigationItems,
  groupedChats,
  directChatsExpanded = true,
  groupChatsExpanded = true,
}: SideNavListProps) {
  const organization = useOrganization();
  const organizationIdFromContext = organization?.organizationId;
  const {
    contentType,
    contentId,
    organizationId: organizationIdFromData,
  } = useSideNavData();
  const organizationId = organizationIdFromData || organizationIdFromContext;

  // Handle grouped chats for chat content type
  if (contentType === "chat" && groupedChats) {
    return (
      <div className="flex flex-col items-start gap-1 w-full flex-1 p-1">
        {/* General chats - always visible at top */}
        {groupedChats.general.length > 0 && (
          <ul className="flex flex-col items-start gap-0 w-full">
            {groupedChats.general.map(({ href, icon, label, delay }) => (
              <SideNavItem
                key={href}
                href={href}
                icon={icon}
                label={label}
                delay={delay}
                isExpanded={isExpanded}
              />
            ))}
          </ul>
        )}

        {/* Direct Messages - collapsible */}
        <SideNavSection
          title="Wiadomości bezpośrednie"
          items={groupedChats.direct}
          isExpanded={directChatsExpanded}
          cookieName="pc_direct_chats_expanded"
          emptyStateMessage="Brak wiadomości bezpośrednich"
        />

        {/* Group Chats - collapsible */}
        <SideNavSection
          title="Czaty grupowe"
          items={groupedChats.group}
          isExpanded={groupChatsExpanded}
          cookieName="pc_group_chats_expanded"
          emptyStateMessage="Brak czatów grupowych"
        />
      </div>
    );
  }

  // Fallback to standard navigation items
  const navigationItems =
    customNavigationItems ||
    (contentType && contentId && organizationId
      ? getNavigationItems(contentType, contentId, organizationId)
      : []);

  return (
    <ul className="flex flex-col items-start gap-1 w-full flex-1 p-1">
      {navigationItems.length > 0 &&
        navigationItems.map(({ href, icon, label, delay }) => (
          <SideNavItem
            key={href}
            href={href}
            icon={icon}
            label={label}
            delay={delay}
            isExpanded={isExpanded}
          />
        ))}
    </ul>
  );
}
