"use client";

import { LayoutGrid, MessageCircle, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { Avatar } from "@/components/Avatar";
import { AddChatModal } from "@/components/Chat/AddChatModal";
import { AddIssueModal } from "@/components/Issue/AddIssueModal";
import { UserSettings } from "@/components/UserSettings";
import { useUserContext } from "@/store/UserContext";
import type { OrganizationMember } from "@/types/api/organization";
import type { ChatLinkedResources } from "@/types/ui/chat-linked-resources";
import { classNamesMerger } from "@/utils/class-names-merger";
import { generateUserInitials } from "@/utils/user-initials-generator";

type MobileMainNavProps = {
  organizationId?: string;
  projectId?: string;
  organizationMembers?: OrganizationMember[];
  currentUserId?: number;
  chatResources?: ChatLinkedResources;
  isChatPage?: boolean;
  userMenu?: React.ReactNode;
};

type MobileNavItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
};

function MobileNavItem({ href, label, icon, isActive }: MobileNavItemProps) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center gap-1"
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={classNamesMerger(
          "flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200",
          isActive
            ? "bg-primary/10 text-primary"
            : "bg-transparent text-foreground/80 hover:bg-light-hover dark:hover:bg-dark-hover",
        )}
      >
        {icon}
      </span>
      <span
        className={classNamesMerger(
          "text-[11px] font-medium leading-4",
          isActive ? "text-primary" : "text-text-secondary",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

const MobileAddTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string;
    disabled?: boolean;
    className?: string;
  }
>(({ label, disabled = false, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    aria-disabled={disabled || undefined}
    className={classNamesMerger(
      "relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-foreground transition-transform duration-200 dark:bg-black",
      disabled
        ? "cursor-not-allowed opacity-60"
        : "active:scale-95 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  >
    <span
      className={classNamesMerger(
        "flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white",
        disabled && "bg-primary/60",
      )}
    >
      <Plus className="size-7" aria-hidden="true" />
    </span>
  </button>
));
MobileAddTrigger.displayName = "MobileAddTrigger";

export function MobileMainNav({
  organizationId,
  projectId,
  organizationMembers,
  currentUserId,
  chatResources,
  isChatPage,
  userMenu = null,
}: MobileMainNavProps) {
  const pathname = usePathname();
  const userCtx = useUserContext();
  const userInitials = generateUserInitials(userCtx?.user || null);

  const organizationPath = organizationId
    ? `/organizations/${organizationId}`
    : "/organizations";
  const projectsHref = organizationId
    ? `${organizationPath}/projects`
    : "/organizations";
  const chatsHref = organizationId
    ? `${organizationPath}/chats`
    : "/organizations";
  const overviewHref = organizationId
    ? `${organizationPath}/overview`
    : "/organizations";

  const isProjectsActive =
    pathname === organizationPath ||
    pathname === overviewHref ||
    pathname.startsWith(projectsHref);
  const isChatsActive = organizationId
    ? pathname.startsWith(chatsHref)
    : pathname.includes("/chats");
  const isSearchActive = pathname.startsWith("/search");

  const showAddChat = Boolean(organizationId && isChatPage && chatResources);

  let addButton: React.ReactNode | null;
  if (projectId) {
    addButton = (
      <AddIssueModal
        projectId={projectId}
        organizationId={organizationId}
        trigger={<MobileAddTrigger label="Dodaj zadanie" />}
      />
    );
  } else if (showAddChat) {
    addButton = (
      <AddChatModal
        organizationId={organizationId}
        organizationMembers={organizationMembers}
        currentUserId={currentUserId}
        chatResources={chatResources}
        trigger={<MobileAddTrigger label="Dodaj czat" />}
      />
    );
  } else {
    addButton = null;
  }

  const profileTrigger = (
    <button
      type="button"
      className="flex flex-1 flex-col items-center justify-center gap-1"
      aria-label="Profil użytkownika"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Avatar
          initials={userInitials}
          size="medium"
          className="bg-primary text-primary-foreground"
          ariaLabel={`Profil użytkownika ${userCtx?.user?.email ?? ""}`}
        />
      </span>
      <span className="text-[11px] font-medium leading-4 text-text-secondary">
        Profil
      </span>
    </button>
  );

  return (
    <div className="md:hidden">
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white dark:bg-black"
        aria-label="Główna nawigacja mobilna"
      >
        <div className="mx-auto max-w-screen-md px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-2">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-1 items-center justify-around gap-2">
              <MobileNavItem
                href={projectsHref}
                icon={<LayoutGrid className="size-5" aria-hidden="true" />}
                label="Projekty"
                isActive={isProjectsActive}
              />
              <MobileNavItem
                href={chatsHref}
                icon={<MessageCircle className="size-5" aria-hidden="true" />}
                label="Czaty"
                isActive={isChatsActive}
              />
            </div>
            {addButton && (
              <div className="-mt-6 flex-shrink-0 px-1">{addButton}</div>
            )}
            <div className="flex flex-1 items-center justify-around gap-2">
              <MobileNavItem
                href="/search"
                icon={<Search className="size-5" aria-hidden="true" />}
                label="Wyszukaj"
                isActive={isSearchActive}
              />
              <UserSettings trigger={profileTrigger}>{userMenu}</UserSettings>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
