"use client";

import React, { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { setSectionExpanded } from "@/services/ui/side-nav-cookie-manager";
import type { NavigationItem } from "@/types/ui/navigation-item";
import { classNamesMerger } from "@/utils/class-names-merger";

import { SideNavItem } from "./SideNavItem";

interface SideNavSectionProps {
  title: string;
  items: NavigationItem[];
  isExpanded: boolean;
  cookieName: string;
  emptyStateMessage: string;
}

export function SideNavSection({
  title,
  items,
  isExpanded,
  cookieName,
  emptyStateMessage,
}: SideNavSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState<string[]>(
    isExpanded ? ["section"] : [],
  );

  useEffect(() => {
    const isOpen = internalExpanded.includes("section");
    setSectionExpanded(cookieName, isOpen);
  }, [internalExpanded, cookieName]);

  return (
    <Accordion
      type="multiple"
      value={internalExpanded}
      onValueChange={setInternalExpanded}
      className="w-full"
    >
      <AccordionItem value="section" className="border-b-0">
        <AccordionTrigger
          className={classNamesMerger(
            "py-2 px-3 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-800",
            "text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider",
            "[&>svg]:h-3 [&>svg]:w-3",
          )}
        >
          {title}
        </AccordionTrigger>
        <AccordionContent className="pb-0 pt-0">
          {items.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 italic">
              {emptyStateMessage}
            </div>
          ) : (
            <ul className="flex flex-col items-start gap-0 w-full">
              {items.map(({ href, icon, label, delay }) => (
                <SideNavItem
                  key={href}
                  href={href}
                  icon={icon}
                  label={label}
                  delay={delay}
                  isExpanded={true}
                />
              ))}
            </ul>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
