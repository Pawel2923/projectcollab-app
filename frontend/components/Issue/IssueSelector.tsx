"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isOk } from "@/lib/types/result";
import { cn } from "@/lib/utils";
import { clientApiGet } from "@/lib/utils/clientApiClient";
import type { Collection } from "@/types/api/collection";
import type { Issue } from "@/types/api/issue";

import { Input } from "../ui/input";

interface IssueSelectorProps {
  name: string;
  projectId: string;
  organizationId?: string;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  excludeIssueId?: string;
  className?: string;
}

export function IssueSelector({
  name,
  projectId,
  organizationId,
  value,
  onChange,
  multiple = false,
  placeholder = "Wybierz zadanie...",
  excludeIssueId,
  className,
}: IssueSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: issuesResult, isLoading } = useQuery({
    queryKey: ["issues", projectId, search],
    queryFn: async () => {
      const searchParam = search ? `&title=${encodeURIComponent(search)}` : "";
      return await clientApiGet<Collection<Issue>>(
        `/issues?projectId=${projectId}${searchParam}`,
      );
    },
    enabled: open,
  });

  const issues =
    issuesResult && isOk(issuesResult) ? issuesResult.value.member : [];
  const filteredIssues = excludeIssueId
    ? issues.filter((issue) => String(issue.id) !== excludeIssueId)
    : issues;

  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === "string"
      ? [value]
      : [];

  const handleSelect = (issueIri: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(issueIri)
        ? currentValues.filter((v) => v !== issueIri)
        : [...currentValues, issueIri];
      onChange(newValues);
    } else {
      onChange(issueIri);
      setOpen(false);
    }
  };

  const handleRemove = (
    issueIri: string,
    e: React.MouseEvent | React.KeyboardEvent,
  ) => {
    e.stopPropagation();
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      onChange(currentValues.filter((v) => v !== issueIri));
    } else {
      onChange("");
    }
  };

  const getSelectedIssues = () => {
    return filteredIssues.filter((issue) =>
      selectedValues.includes(issue["@id"] || ""),
    );
  };

  const selectedIssues = getSelectedIssues();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !selectedValues.length && "text-muted-foreground",
            className,
          )}
        >
          {selectedIssues.length > 0 ? (
            <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
              {selectedIssues.map((issue) => {
                const issueUrl =
                  organizationId && projectId
                    ? `/organizations/${organizationId}/projects/${projectId}/issues/${issue.id}`
                    : undefined;

                return (
                  <span
                    key={issue["@id"]}
                    className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs"
                  >
                    {issueUrl ? (
                      <Link
                        href={issueUrl}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {issue.key}
                      </Link>
                    ) : (
                      issue.key
                    )}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleRemove(issue["@id"] || "", e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRemove(issue["@id"] || "", e);
                        }
                      }}
                      className="hover:text-destructive cursor-pointer"
                      aria-label="Remove issue"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-2">
          <Input
            name={name}
            id={name}
            type="text"
            placeholder="Szukaj zadania..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nie znaleziono zadań
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const isSelected = selectedValues.includes(issue["@id"] || "");
              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => handleSelect(issue["@id"] || "")}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent",
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col items-start flex-1 overflow-hidden">
                    <span className="font-medium">{issue.key}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {issue.title}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
