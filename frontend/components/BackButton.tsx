import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface BackButtonProps {
  href: string;
  label: string;
  ariaLabel?: string;
  position?: "fixed" | "absolute";
}

export function BackButton({
  href,
  label,
  ariaLabel,
  position = "absolute",
}: BackButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className={`border shadow-sm ${position} top-4 left-4`}
          aria-label={ariaLabel ?? label}
          asChild
        >
          <Link href={href}>
            <ChevronLeftIcon aria-hidden="true" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
