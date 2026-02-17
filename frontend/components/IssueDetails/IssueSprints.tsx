"use client";

import { Loader2Icon, PlusCircleIcon, XIcon } from "lucide-react";
import Link from "next/link";
import React, { useState, useTransition } from "react";

import addIssueToSprint from "@/actions/sprint/addIssueToSprint";
import removeIssueFromSprint from "@/actions/sprint/removeIssueFromSprint";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { AppError } from "@/services/error/app-error";
import { getMessageTitle } from "@/services/message-mapper/message-mapper";
import type { IssueDetails } from "@/types/api/issue";
import type { Sprint } from "@/types/api/sprint";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface IssueSprintsProps {
  issue: IssueDetails;
  availableSprints: Sprint[];
  organizationId: string;
  projectId: string;
}

export function IssueSprints({
  issue,
  availableSprints,
  organizationId,
  projectId,
}: IssueSprintsProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showError, showSuccess } = useErrorHandler();

  const issueSprints = (issue.issueSprints || []).filter(
    (is) =>
      !is.sprint || typeof is.sprint === "string" || !is.sprint.isArchived,
  );

  console.log("issueSprints: ", issueSprints);

  const assignedSprintIris = issueSprints.map((is) => {
    if (!is.sprint) return "";
    if (typeof is.sprint === "string") return is.sprint;
    return is.sprint["@id"];
  });

  const unassignedSprints = availableSprints.filter(
    (sprint) =>
      !sprint.isArchived && !assignedSprintIris.includes(sprint["@id"]),
  );

  const handleAddSprint = (sprintIri: string) => {
    startTransition(async () => {
      const result = await addIssueToSprint(null, {
        issueIri: issue["@id"],
        sprintIri,
        organizationId,
        projectId,
      });

      if (result.ok) {
        showSuccess("Dodano zadanie do sprintu");
        setOpen(false);
      } else {
        const message =
          result.message || getMessageTitle(result.code) || result.code;
        showError(
          new AppError({
            message,
            code: result.code,
            status: result.status,
            violations: result.violations,
          }),
        );
      }
    });
  };

  const handleRemoveSprint = (issueSprintIri: string) => {
    startTransition(async () => {
      const result = await removeIssueFromSprint(null, {
        issueSprintIri,
        organizationId,
        projectId,
      });

      if (result.ok) {
        showSuccess("Usunięto zadanie ze sprintu");
      } else {
        const message =
          result.message || getMessageTitle(result.code) || result.code;
        showError(
          new AppError({
            message,
            code: result.code,
            status: result.status,
            violations: result.violations,
          }),
        );
      }
    });
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label
          withoutControls
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Powiązane sprinty
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  disabled={isPending}
                  type="button"
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  <span className="sr-only">Dodaj sprint</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Dodaj sprint</TooltipContent>
          </Tooltip>
          <PopoverContent className="p-0" align="end">
            <Command>
              <CommandInput placeholder="Szukaj sprintu..." />
              <CommandList>
                <CommandEmpty>Nie znaleziono sprintów.</CommandEmpty>
                <CommandGroup>
                  {unassignedSprints.map((sprint) => (
                    <CommandItem
                      key={sprint["@id"]}
                      value={sprint.name}
                      onSelect={() => handleAddSprint(sprint["@id"])}
                    >
                      {sprint.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {issueSprints.length > 0 ? (
        <ul className="space-y-2">
          {issueSprints.map((issueSprint) => (
            <li
              key={issueSprint["@id"]}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <Link
                href={`/organizations/${organizationId}/projects/${projectId}/sprints`}
                className="hover:underline"
              >
                {issueSprint.sprint && typeof issueSprint.sprint !== "string"
                  ? issueSprint.sprint.name
                  : "Nieznany sprint"}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveSprint(issueSprint["@id"])}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <XIcon className="h-4 w-4" />
                )}
                <span className="sr-only">Usuń ze sprintu</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Brak powiązanych sprintów
        </p>
      )}
    </div>
  );
}
