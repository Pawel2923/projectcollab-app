"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronDown as ChevronDownPriority,
  ChevronRight,
  ChevronsUp,
  ChevronUp,
  Equal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Issue } from "@/lib/types/api";
import { isOk } from "@/lib/types/result";
import { clientApiGet } from "@/lib/utils/clientApiClient";
import { useOrganization } from "@/store/OrganizationContext";

import { AssigneeAvatar } from "../AssigneeAvatar";

interface IssueRowProps {
  issue: Issue;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  projectId: string;
}

interface IssueStatusEntity {
  "@id": string;
  id: number;
  value: string;
}

interface ResolutionEntity {
  "@id": string;
  id: number;
  value: string;
}

interface UserEntity {
  "@id": string;
  id: string;
  email: string;
}

export function IssueRow({
  issue,
  depth,
  hasChildren,
  isExpanded,
  onToggleExpand,
  projectId,
}: IssueRowProps) {
  const router = useRouter();
  const organization = useOrganization();
  const organizationId = organization?.organizationId;

  // Fetch status
  const { data: statusResult } = useQuery({
    queryKey: ["issueStatus", issue.status],
    queryFn: async () => {
      return await clientApiGet<IssueStatusEntity>(issue.status);
    },
    enabled: !!issue.status,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch resolution if exists
  const { data: resolutionResult } = useQuery({
    queryKey: ["resolution", issue.resolution],
    queryFn: async () => {
      return issue.resolution
        ? await clientApiGet<ResolutionEntity>(issue.resolution)
        : null;
    },
    enabled: !!issue.resolution,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch reporter
  const { data: reporterResult } = useQuery({
    queryKey: ["user", issue.reporter],
    queryFn: async () => {
      return issue.reporter
        ? await clientApiGet<UserEntity>(issue.reporter?.["@id"] || "")
        : null;
    },
    enabled: !!issue.reporter,
    staleTime: 5 * 60 * 1000,
  });

  const status = statusResult && isOk(statusResult) ? statusResult.value : null;
  const resolution =
    resolutionResult && isOk(resolutionResult) ? resolutionResult.value : null;
  const reporter =
    reporterResult && isOk(reporterResult) ? reporterResult.value : null;

  const handleClick = () => {
    if (organizationId && projectId) {
      router.push(
        `/organizations/${organizationId}/projects/${projectId}/issues/${issue.id}`,
      );
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand();
  };

  return (
    <TableRow
      onClick={handleClick}
      className="cursor-pointer hover:bg-muted/80 transition-colors"
    >
      <TableCell>
        <div
          className="flex items-center gap-1"
          style={{ paddingLeft: `${depth * 32}px` }}
        >
          {hasChildren && (
            <button
              onClick={handleToggleClick}
              className="p-0.5 hover:bg-accent rounded transition-colors"
              aria-label={isExpanded ? "Zwiń" : "Rozwiń"}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-dark-primary font-medium">{issue.key}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Klucz zadania: {issue.key}</p>
              {issue.createdAt && (
                <p className="text-xs text-muted-foreground">
                  Utworzono: {formatDate(issue.createdAt)}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      <TableCell>
        <div style={{ paddingLeft: `${depth * 40}px` }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium truncate block">{issue.title}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="font-medium">{issue.title}</p>
              {issue.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {issue.description.substring(0, 200)}
                  {issue.description.length > 200 && "..."}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm">{status?.value || "—"}</span>
          </TooltipTrigger>
          <TooltipContent>Status: {status?.value || "Nieznany"}</TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-sm">
              {renderPriority(issue.priority)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Priorytet: {getPriorityLabel(issue.priority)}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm">
              {issue.endDate ? formatDate(issue.endDate) : "—"}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {issue.endDate ? (
              <>
                <p>Termin: {formatDate(issue.endDate, true)}</p>
                {issue.startDate && (
                  <p className="text-xs text-muted-foreground">
                    Start: {formatDate(issue.startDate, true)}
                  </p>
                )}
              </>
            ) : (
              "Brak terminu"
            )}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell>
        <div className="flex gap-1">
          {issue.assignees.length > 0 ? (
            issue.assignees
              .slice(0, 3)
              .map((assignee, index) => (
                <AssigneeAvatar
                  key={index}
                  userIri={assignee["@id"]}
                  size="small"
                  ariaLabel={assignee.username || assignee.email}
                />
              ))
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-muted-foreground">—</span>
              </TooltipTrigger>
              <TooltipContent>Brak przypisanych osób</TooltipContent>
            </Tooltip>
          )}
          {issue.assignees.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                  +{issue.assignees.length - 3}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Jeszcze {issue.assignees.length - 3} osób
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm">{reporter?.email || "—"}</span>
          </TooltipTrigger>
          <TooltipContent>
            Zgłaszający: {reporter?.email || "Nieznany"}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm">{resolution?.value || "—"}</span>
          </TooltipTrigger>
          <TooltipContent>
            {resolution?.value
              ? `Rozwiązano: ${resolution.value}`
              : "Nierozwiązane"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

function renderPriority(priority: string | undefined): React.ReactNode {
  switch (priority) {
    case "low":
      return (
        <>
          <ChevronDownPriority className="text-[#0D4D89]" size={16} />
          <span>Niski</span>
        </>
      );
    case "medium":
      return (
        <>
          <Equal className="text-[#0B6B58]" size={16} />
          <span>Średni</span>
        </>
      );
    case "high":
      return (
        <>
          <ChevronUp className="text-orange-600" size={16} />
          <span>Wysoki</span>
        </>
      );
    case "critical":
      return (
        <>
          <ChevronsUp className="text-destructive" size={16} />
          <span>Krytyczny</span>
        </>
      );
    default:
      return <span>—</span>;
  }
}

function getPriorityLabel(priority: string | undefined): string {
  switch (priority) {
    case "low":
      return "Niski";
    case "medium":
      return "Średni";
    case "high":
      return "Wysoki";
    case "critical":
      return "Krytyczny";
    default:
      return "Nieznany";
  }
}

function formatDate(dateString: string, includeTime: boolean = false): string {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();

  if (includeTime) {
    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: currentYear === date.getFullYear() ? undefined : "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: currentYear === date.getFullYear() ? undefined : "numeric",
  });
}
