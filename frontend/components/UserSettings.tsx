"use client";

import React from "react";

import { getUserInitials } from "@/lib/utils/userUtils";
import { useUserContext } from "@/store/UserContext";

import { ChevronDownIcon } from "../assets/icons/ChevronDownIcon";
import { Avatar } from "./Avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface UserSettingsProps {
  children: React.ReactNode;
  trigger?: React.ReactElement;
}

export function UserSettings({ children, trigger }: UserSettingsProps) {
  const userCtx = useUserContext();
  const defaultTrigger = (
    <Button
      variant="transparent"
      size="dynamic"
      className="data-[state=open]:[&_svg]:rotate-180"
    >
      <Avatar
        initials={getUserInitials(userCtx?.user || null)}
        size="large"
        ariaLabel={`Profil użytkownika ${userCtx?.user?.email}`}
      />
      <ChevronDownIcon
        className="transition-transform duration-300"
        aria-hidden="true"
      />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-max max-w-[300px]">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
