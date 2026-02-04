import type { LinkProps } from "next/link";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationButtonProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  title?: string;
}

export function NavigationButton({
  href,
  children,
  className = "",
  isActive = false,
  isCollapsed = false,
  ...rest
}: NavigationButtonProps) {
  return (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start relative min-h-[40px] transition-all duration-300",
        isCollapsed ? "justify-center px-0" : "px-4 gap-1.5",
        isActive
          ? "text-foreground border-l-[3px] border-primary bg-light"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Link href={href} {...rest}>
        {children}
      </Link>
    </Button>
  );
}
