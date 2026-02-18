import React from "react";

import { ListIcon } from "@/assets/icons/ListIcon";
import { SettingsIcon } from "@/assets/icons/SettingsIcon";
import { SprintIcon } from "@/assets/icons/SprintIcon";
import { StarIcon } from "@/assets/icons/StarIcon";
import { TableIcon } from "@/assets/icons/TableIcon";
import type { NavigationItem } from "@/types/ui/navigation-item";

export type ContentType = "project" | "chat";

/**
 * Type guard to check if content type is valid
 */
export function isValidContentType(type: string): type is ContentType {
  return type === "project" || type === "chat";
}

/**
 * Get navigation items based on content type
 * @throws Error if content type is invalid
 */
export const getNavigationItems = (
  contentType: ContentType,
  contentId?: string,
  organizationId?: string,
): NavigationItem[] => {
  if (!isValidContentType(contentType)) {
    console.error(`Invalid content type: ${contentType}`);
    return [];
  }

  const getItems = navigationRegistry[contentType];
  if (!getItems) {
    console.error(
      `No navigation items registered for content type: ${contentType}`,
    );
    return [];
  }

  if (!contentId || !organizationId) {
    console.warn(
      `Missing required parameters for ${contentType} navigation items`,
    );
    return [];
  }

  return getItems(contentId, organizationId);
};

const getProjectNavigationItems = (
  projectId: string,
  organizationId: string,
): NavigationItem[] => [
  {
    href: `/organizations/${organizationId}/projects/${projectId}/summary`,
    icon: <StarIcon />,
    label: "Podsumowanie",
    delay: undefined,
  },
  {
    href: `/organizations/${organizationId}/projects/${projectId}/table`,
    icon: <TableIcon />,
    label: "Tablica Kanban",
    delay: "75",
  },
  {
    href: `/organizations/${organizationId}/projects/${projectId}/list`,
    icon: <ListIcon />,
    label: "Lista zadań",
    delay: "150",
  },
  {
    href: `/organizations/${organizationId}/projects/${projectId}/sprints`,
    icon: <SprintIcon />,
    label: "Sprinty",
    delay: "225",
  },
  {
    href: `/organizations/${organizationId}/projects/${projectId}/settings`,
    icon: <SettingsIcon />,
    label: "Ustawienia",
    delay: "300",
  },
];

const getChatsNavigationItems = (
  chatId: string,
  organizationId: string,
): NavigationItem[] => [
  {
    href: `/organizations/${organizationId}/chats/${chatId}/general`,
    icon: <StarIcon />,
    label: "Główne",
    delay: undefined,
  },
  {
    href: `/organizations/${organizationId}/chats/${chatId}/projects`,
    icon: <TableIcon />,
    label: "Projekty",
    delay: "75",
  },
  {
    href: `/organizations/${organizationId}/chats/${chatId}/settings`,
    icon: <SettingsIcon />,
    label: "Ustawienia",
    delay: "225",
  },
];

export const navigationRegistry: Record<
  ContentType,
  (id: string, organizationId: string) => NavigationItem[]
> = {
  project: getProjectNavigationItems,
  chat: getChatsNavigationItems,
};
