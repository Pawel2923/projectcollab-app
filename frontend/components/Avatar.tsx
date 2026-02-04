import React from "react";

import {
  Avatar as ShadcnAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  size: "small" | "medium" | "large";
  ariaLabel?: string;
  isCircle?: boolean;
  className?: string;
  src?: string;
  onClick?: () => void;
}

export function Avatar({
  initials,
  size,
  ariaLabel,
  isCircle = true,
  className,
  src,
  onClick,
}: AvatarProps) {
  const sizeClass =
    size === "small"
      ? "h-6 w-6 text-xs"
      : size === "large"
        ? "h-[3.125rem] w-[3.125rem] text-xl"
        : "h-8 w-8 text-sm";

  const rounding = isCircle ? "rounded-full" : "rounded-lg";

  return (
    <ShadcnAvatar
      className={cn(sizeClass, rounding, className)}
      onClick={onClick}
    >
      <AvatarImage src={src} alt={ariaLabel || `Avatar ${initials}`} />
      <AvatarFallback
        className="bg-primary text-primary-foreground flex items-center justify-center font-medium"
        aria-label={ariaLabel || `Avatar ${initials}`}
      >
        {initials}
      </AvatarFallback>
    </ShadcnAvatar>
  );
}
