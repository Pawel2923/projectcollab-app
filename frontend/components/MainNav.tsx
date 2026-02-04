"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useRecentProjects } from "@/hooks/useRecentProjects";
import type { Collection, Project } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/store/OrganizationContext";

export function MainNav({
  organizationId: propOrganizationId,
}: {
  organizationId?: string;
}) {
  const organization = useOrganization();
  const organizationId = propOrganizationId ?? organization?.organizationId;
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const { showError } = useErrorHandler();
  const { sortProjectsByRecency, addRecentProject } = useRecentProjects();

  useEffect(() => {
    if (!organizationId) {
      setProjects([]);
      return;
    }

    const fetchProjects = async () => {
      try {
        const encodedOrgId = encodeURIComponent(
          `organizationId[]=${organizationId}`,
        );
        const response = await fetch(
          `/api/proxy?endpoint=/projects?${encodedOrgId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          showError(data);
          return;
        }

        const projectsData: Collection<Project> = data;
        const sortedProjects = sortProjectsByRecency(projectsData.member);

        setProjects(sortedProjects.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        showError(error);
      }
    };

    fetchProjects();
  }, [organizationId, showError, sortProjectsByRecency]);

  if (!organizationId) {
    return null;
  }

  const overviewHref = organizationId
    ? `/organizations/${organizationId}/overview`
    : "/organizations";
  const projectsHref = organizationId
    ? `/organizations/${organizationId}/projects`
    : "/organizations";
  const chatsHref = organizationId
    ? `/organizations/${organizationId}/chats`
    : "/organizations";

  const isOverviewActive = pathname === overviewHref;
  const isProjectsActive =
    pathname === projectsHref || pathname.startsWith(`${projectsHref}/`);
  const isChatsActive =
    pathname === chatsHref || pathname.startsWith(`${chatsHref}/`);

  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-6">
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              "flex justify-center items-center p-2 gap-2 rounded-lg bg-transparent hover:!bg-light-hover dark:hover:!bg-dark-hover active:scale-95 active:text-gray-400 transition-all duration-300",
              isOverviewActive && "bg-light dark:bg-dark",
            )}
            asChild
          >
            <Link href={overviewHref} passHref>
              Główna
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          {projects.length > 0 ? (
            <>
              <NavigationMenuTrigger
                className={cn(
                  "flex justify-center items-center p-2 gap-2 rounded-lg bg-transparent hover:!bg-light-hover dark:hover:!bg-dark-hover active:scale-95 active:text-gray-400 transition-all duration-300",
                  isProjectsActive && "bg-light dark:bg-dark",
                )}
              >
                Projekty
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-max max-w-[400px] gap-1 p-2 bg-white dark:bg-black border border-border shadow-lg rounded-lg">
                  <NavigationMenuLink asChild>
                    <Link
                      href={`/organizations/${organizationId}/projects`}
                      className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-light-hover dark:hover:bg-dark-hover focus:bg-light-hover dark:focus:bg-dark-hover break-words"
                    >
                      Wszystkie projekty
                    </Link>
                  </NavigationMenuLink>
                  <li className="px-2 pt-1 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 select-none cursor-default">
                    Ostatnie projekty
                  </li>
                  {projects.map((project) => (
                    <li key={project.id}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/organizations/${organizationId}/projects/${project.id}`}
                          onClick={() => addRecentProject(project.id)}
                          className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-light-hover dark:hover:bg-dark-hover focus:bg-light-hover dark:focus:bg-dark-hover break-words"
                        >
                          {project.name}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </>
          ) : (
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "flex justify-center items-center p-2 gap-2 rounded-lg bg-transparent hover:!bg-light-hover dark:hover:!bg-dark-hover active:scale-95 active:text-gray-400 transition-all duration-300",
                isProjectsActive && "bg-light dark:bg-dark",
              )}
              asChild
            >
              <Link href={projectsHref} passHref>
                Projekty
              </Link>
            </NavigationMenuLink>
          )}
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              "flex justify-center items-center p-2 gap-2 rounded-lg bg-transparent hover:!bg-light-hover dark:hover:!bg-dark-hover active:scale-95 active:text-gray-400 transition-all duration-300",
              isChatsActive && "bg-light dark:bg-dark",
            )}
            asChild
          >
            <Link href={chatsHref} passHref>
              Czaty
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
