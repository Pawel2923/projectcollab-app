"use client";

import { Building2, FolderKanban, MessageSquare, Users } from "lucide-react";
import React from "react";

import { ServerSideNav } from "@/components/ServerSideNav";
import type { NavigationItem } from "@/components/SideNav/types";

interface OrganizationSideNavProps {
  organizationId: string;
  organizationName?: string;
  organizationAcronym?: string;
  isSideNavExpanded?: boolean;
}

export function OrganizationSideNav({
  organizationId,
  organizationName,
  organizationAcronym,
  isSideNavExpanded,
}: OrganizationSideNavProps) {
  const navigationItems: NavigationItem[] = [
    {
      href: `/organizations/${organizationId}/overview`,
      label: "Przegląd",
      icon: <Building2 />,
    },
    {
      href: `/organizations/${organizationId}/projects`,
      label: "Projekty",
      icon: <FolderKanban />,
    },
    {
      href: `/organizations/${organizationId}/members`,
      label: "Członkowie",
      icon: <Users />,
    },
    {
      href: `/organizations/${organizationId}/chats`,
      label: "Czaty",
      icon: <MessageSquare />,
    },
  ];

  return (
    <ServerSideNav
      contentId={organizationId}
      contentType="project"
      navigationItems={navigationItems}
      headerTitle={organizationName}
      headerAcronym={organizationAcronym}
      isSideNavExpanded={isSideNavExpanded}
      organizationId={organizationId}
    />
  );
}
