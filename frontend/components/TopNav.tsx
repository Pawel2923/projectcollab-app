"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype";
import { AddIssueModal } from "@/components/Issue/AddIssueModal";
import { OrganizationProvider } from "@/store/OrganizationContext";
import type { OrganizationMember } from "@/types/api/organization";
import type { ChatLinkedResources } from "@/types/ui/chat-linked-resources";

import { AddChatModal } from "./Chat/AddChatModal";
import { InteractiveSearchInput } from "./InteractiveSearchInput";
import { MainNav } from "./MainNav";
import { MobileMainNav } from "./MobileMainNav";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { UserSettings } from "./UserSettings";

type TopNavProps = {
  projectId?: string;
  organizationId?: string;
  organizationMembers?: OrganizationMember[];
  currentUserId?: number;
  chatResources?: ChatLinkedResources;
};

export function TopNav({
  projectId,
  organizationId,
  organizationMembers,
  currentUserId,
  chatResources,
}: TopNavProps) {
  const pathname = usePathname();
  const isChatPage = organizationId
    ? pathname === `/organizations/${organizationId}/chats` ||
      pathname.startsWith(`/organizations/${organizationId}/chats/`)
    : false;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userMenu = (
    <DropdownMenuItem asChild>
      <Link href="/logout">Wyloguj się</Link>
    </DropdownMenuItem>
  );

  const navContent = (
    <>
      <nav
        className="hidden h-21 w-full flex-wrap items-center justify-between gap-4 border-b border-border bg-white px-4 py-2 dark:bg-black md:flex col-span-2 sticky top-0 z-20"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-6">
          <Link href={"/"}>
            <ProjectCollabLogotype />
          </Link>
          <MainNav organizationId={organizationId} />
        </div>
        <div className="flex items-center gap-4">
          {mounted && (
            <>
              <InteractiveSearchInput />
              {projectId && <AddIssueModal projectId={projectId} />}
              {organizationId && isChatPage && (
                <AddChatModal
                  organizationId={organizationId}
                  organizationMembers={organizationMembers}
                  currentUserId={currentUserId}
                  chatResources={chatResources}
                />
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <UserSettings>{userMenu}</UserSettings>
        </div>
      </nav>
      <MobileMainNav
        organizationId={organizationId}
        projectId={projectId}
        organizationMembers={organizationMembers}
        currentUserId={currentUserId}
        chatResources={chatResources}
        isChatPage={isChatPage}
        userMenu={userMenu}
      />
    </>
  );

  if (organizationId) {
    return (
      <OrganizationProvider organizationId={organizationId}>
        {navContent}
      </OrganizationProvider>
    );
  }

  return navContent;
}
