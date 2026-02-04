"use client";

import type { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { NavigationButton } from "./NavigationButton";

interface ActiveNavigationButtonProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  isCollapsed?: boolean;
  title?: string;
}

export function ActiveNavigationButton({
  href,
  children,
  isCollapsed = false,
  ...rest
}: ActiveNavigationButtonProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <li className="w-full">
      <NavigationButton
        href={href}
        isActive={isActive}
        isCollapsed={isCollapsed}
        {...rest}
      >
        {children}
      </NavigationButton>
    </li>
  );
}
