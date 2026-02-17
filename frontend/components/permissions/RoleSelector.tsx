"use client";

import { Info } from "lucide-react";
import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPermissionDescription } from "@/services/permissions/permissions-service";
import type { OrganizationRole } from "@/types/permissions/roles";

interface RoleSelectorProps {
  value: OrganizationRole;
  onChange: (role: OrganizationRole) => void;
  disabled?: boolean;
  availableRoles: OrganizationRole[];
}

function formatRoleName(role: OrganizationRole): string {
  const tokenMap: Record<string, string> = {
    CREATOR: "Twórca",
    OWNER: "Właściciel",
    ADMIN: "Administrator",
    ADMINISTRATOR: "Administrator",
    MEMBER: "Członek",
    MANAGER: "Kierownik",
    MAINTAINER: "Opiekun",
    EDITOR: "Redaktor",
    VIEWER: "Obserwator",
    USER: "Użytkownik",
  };
  const tokens = role.split("_");
  const translated = tokens
    .map((t) => tokenMap[t] ?? t.charAt(0) + t.slice(1).toLowerCase())
    .join(" ");
  return translated;
}

export default function RoleSelector({
  value,
  onChange,
  disabled = false,
  availableRoles,
}: RoleSelectorProps) {
  const permissionDescription = getPermissionDescription(value, "organization");

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {formatRoleName(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">
                Uprawnienia roli {formatRoleName(value)}:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {permissionDescription.base.map((permission) => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
              {permissionDescription.inherited && (
                <div className="space-y-1 pt-2 border-t mt-2">
                  <p className="text-xs text-muted-foreground">Dziedziczone:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {permissionDescription.inherited.map((group) => (
                      <li key={group}>{group}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
