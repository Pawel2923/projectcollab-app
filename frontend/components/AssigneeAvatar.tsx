"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

import { isOk } from "@/error/result";
import { clientApiGet } from "@/lib/utils/clientApiClient";
import type { User } from "@/types/api/user";
import { generateUserInitials } from "@/utils/user-initials-generator";

import { Avatar } from "./Avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface UserAvatarProps {
  userIri?: string;
  size: "small" | "medium" | "large";
  ariaLabel?: string;
  isCircle?: boolean;
}

export function AssigneeAvatar({
  userIri,
  size,
  ariaLabel,
  isCircle,
}: UserAvatarProps) {
  const {
    data: userResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userIri],
    queryFn: async () => {
      return await clientApiGet<User>(userIri);
    },
    staleTime: 5 * 60 * 1000,
  });

  if (error) {
    console.error("Failed to load user:", error);
  }

  if (isLoading) {
    return (
      <Avatar
        initials="..."
        size={size}
        ariaLabel="Ładowanie..."
        isCircle={isCircle}
      />
    );
  }

  const user = userResult && isOk(userResult) ? userResult.value : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          initials={generateUserInitials(user)}
          size={size}
          ariaLabel={ariaLabel}
          isCircle={isCircle}
        />
      </TooltipTrigger>
      <TooltipContent>Przypisano użytkownika: {ariaLabel}</TooltipContent>
    </Tooltip>
  );
}
