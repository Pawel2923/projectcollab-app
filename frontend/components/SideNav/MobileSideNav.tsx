"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GroupedChats } from "@/lib/types/api";
import { cn } from "@/lib/utils";

import { getNavigationItems } from "./constants";
import { useSideNavData } from "./SideNavContext";
import type { NavigationItem } from "./types";

interface MobileSideNavProps {
  navigationItems?: NavigationItem[];
  groupedChats?: GroupedChats;
  organizationId?: string;
}

export function MobileSideNav({
  navigationItems,
  groupedChats,
  organizationId,
}: MobileSideNavProps) {
  const pathname = usePathname();
  const { contentType, contentId } = useSideNavData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const chatNavigationItems = useMemo(
    () =>
      groupedChats
        ? [
            ...(groupedChats?.general || []),
            ...(groupedChats?.direct || []),
            ...(groupedChats?.group || []),
          ]
        : [],
    [groupedChats],
  );

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  if (groupedChats) {
    if (chatNavigationItems.length === 0) {
      return null;
    }

    const activeChat =
      chatNavigationItems.find(
        ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
      ) || chatNavigationItems[0];

    const chatSections = [
      { title: "Ogólne", items: groupedChats?.general || [] },
      { title: "Wiadomości bezpośrednie", items: groupedChats?.direct || [] },
      { title: "Czaty grupowe", items: groupedChats?.group || [] },
    ];

    return (
      <>
        <div className="md:hidden sticky top-0 z-30 w-full border-b border-border bg-white/95 px-3 py-2 backdrop-blur dark:bg-black/80">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Czaty
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {activeChat.label}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="shrink-0 gap-2"
            >
              <Menu className="size-4" aria-hidden="true" />
              Lista
            </Button>
          </div>
        </div>

        <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DialogContent
            hideClose
            className="md:hidden left-0 top-0 h-[90vh] max-w-sm translate-x-0 translate-y-0 rounded-none border-l-0 border-r bg-background p-0 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left sm:max-w-md"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <DialogTitle className="text-base font-semibold">
                Twoje czaty
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Zamknij listę czatów"
                className="shrink-0 gap-2 rounded-full border border-border bg-white/90 px-3 py-1.5 text-sm font-semibold hover:bg-light-hover dark:bg-black/70 dark:hover:bg-dark-hover"
              >
                <X className="size-4" aria-hidden="true" />
                Zamknij
              </Button>
            </div>

            <ScrollArea className="h-[calc(90vh-56px)] px-1">
              <div className="space-y-6 px-3 py-4">
                {chatSections.map(
                  ({ title, items }) =>
                    items.length > 0 && (
                      <div key={title} className="space-y-2">
                        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          {title}
                        </p>
                        <div className="space-y-1">
                          {items.map(({ href, icon, label }) => {
                            const isActive =
                              pathname === href ||
                              pathname.startsWith(`${href}/`);

                            return (
                              <Link
                                key={href}
                                href={href}
                                onClick={() => setIsDrawerOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                                  isActive
                                    ? "border-primary/60 bg-primary/10 text-primary"
                                    : "border-border bg-card hover:bg-light-hover dark:hover:bg-dark-hover",
                                )}
                                aria-current={isActive ? "page" : undefined}
                              >
                                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
                                  {icon}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-left">
                                  {label}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const resolvedNavigationItems =
    navigationItems ||
    (organizationId && contentType && contentId
      ? getNavigationItems(contentType, contentId, organizationId)
      : []);

  if (resolvedNavigationItems.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden sticky top-0 z-30 w-full border-b border-border bg-white/95 px-3 py-2 backdrop-blur dark:bg-black/80">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {resolvedNavigationItems.map(({ href, icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const Icon =
            typeof icon === "function" ? (icon as React.ComponentType) : null;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-white text-foreground hover:bg-light-hover dark:bg-black dark:hover:bg-dark-hover",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                {Icon ? <Icon /> : (icon as React.ReactNode)}
              </span>
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
