"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGanttData } from "@/hooks/useGanttData";
import { useGanttState } from "@/hooks/useGanttState";
import { useGanttTimeline } from "@/hooks/useGanttTimeline";
import type { Issue, IssueStatus } from "@/types/api/issue";
import type { Sprint } from "@/types/api/sprint";
import type { GanttViewMode } from "@/types/ui/gantt-view-mode";

interface GanttChartProps {
  issues: Issue[];
  sprints: Sprint[];
  statuses: IssueStatus[];
  now?: number;
  selectedSprintId: string;
  viewMode: GanttViewMode;
}

export function GanttChart({
  issues,
  sprints,
  statuses,
  now,
  selectedSprintId,
  viewMode,
}: GanttChartProps) {
  const router = useRouter();

  const { expandedSprints, toggleSprint } = useGanttState(sprints);

  const {
    issuesBySprint,
    unassignedIssues,
    filteredSprints,
    showUnassigned,
    getStatusName,
  } = useGanttData(issues, sprints, statuses, selectedSprintId);

  const { columns, getTaskPosition, config } = useGanttTimeline(viewMode, now);

  const handleTaskClick = (issue: Issue) => {
    const issueId = issue.id;
    router.push(`issues/${issueId}`);
  };

  if (!config) {
    return null;
  }

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-0">
        <div className="flex h-[600px]">
          {/* Left Column: Tasks List */}
          <div className="w-64 border-r bg-background flex-shrink-0 flex flex-col">
            <div className="h-12 border-b flex items-center px-4 font-medium bg-gray-200 flex-shrink-0">
              Zadania
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredSprints.map((sprint) => {
                const sprintIssues = issuesBySprint[sprint["@id"]] || [];
                const isExpanded = expandedSprints[sprint["@id"]];

                return (
                  <div key={sprint["@id"]} className="border-b">
                    <div
                      className="flex items-center px-4 py-2 bg-muted/20 font-medium text-sm cursor-pointer hover:bg-muted/30"
                      onClick={() => toggleSprint(sprint["@id"])}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      {sprint.name}
                    </div>
                    {isExpanded && (
                      <div>
                        {sprintIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="pl-8 pr-4 py-2 text-sm border-b hover:bg-muted/50 cursor-pointer truncate"
                            title={issue.title}
                            onClick={() => handleTaskClick(issue)}
                          >
                            {issue.key}: {issue.title}
                          </div>
                        ))}
                        {sprintIssues.length === 0 && (
                          <div className="pl-8 pr-4 py-2 text-sm text-muted-foreground italic">
                            Brak zadań
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unassigned Issues */}
              {showUnassigned && unassignedIssues.length > 0 && (
                <div className="border-b">
                  <div
                    className="flex items-center px-4 py-2 bg-muted/20 font-medium text-sm cursor-pointer hover:bg-muted/30"
                    onClick={() => toggleSprint("unassigned")}
                  >
                    {expandedSprints["unassigned"] ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    Nieprzypisane
                  </div>
                  {expandedSprints["unassigned"] && (
                    <div>
                      {unassignedIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="pl-8 pr-4 py-2 text-sm border-b hover:bg-muted/50 cursor-pointer truncate"
                          title={issue.title}
                          onClick={() => handleTaskClick(issue)}
                        >
                          {issue.key}: {issue.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[800px] h-full flex flex-col">
              {/* Timeline Header */}
              <div className="h-12 border-b flex bg-gray-200 flex-shrink-0">
                {columns.map((col, i) => (
                  <div
                    key={i}
                    className="flex-1 border-r px-2 py-1 text-xs text-center flex flex-col justify-center"
                  >
                    <span className="font-medium">
                      {viewMode === "week" ? `Tydzień ${i + 1}` : col.label}
                    </span>
                    {viewMode === "week" && (
                      <span className="text-muted-foreground">{col.label}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Timeline Grid */}
              <div className="flex-1 relative overflow-y-auto">
                {/* Vertical Grid Lines */}
                <div className="absolute inset-0 flex pointer-events-none h-full">
                  {columns.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-r border-dashed border-gray-200 h-full"
                    />
                  ))}
                </div>

                {/* Current Day Line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-destructive z-10 pointer-events-none"
                  style={{ left: `${(7 / config.days) * 100}%` }}
                >
                  <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-destructive" />
                </div>

                {/* Task Bars Container */}
                <div className="w-full">
                  <TooltipProvider>
                    {filteredSprints.map((sprint) => {
                      const sprintIssues = issuesBySprint[sprint["@id"]] || [];
                      const isExpanded = expandedSprints[sprint["@id"]];

                      return (
                        <div key={sprint["@id"]}>
                          <div className="h-[37px] border-b border-transparent"></div>{" "}
                          {/* Spacer for sprint header */}
                          {isExpanded &&
                            sprintIssues.map((issue) => {
                              const pos = getTaskPosition(issue);
                              return (
                                <div
                                  key={issue.id}
                                  className="h-[37px] border-b border-transparent relative w-full"
                                >
                                  {pos && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className="absolute h-6 top-[6px] bg-primary rounded-md shadow-sm flex items-center px-2 text-x overflow-hidden whitespace-nowrap cursor-pointer hover:bg-primary/90"
                                          style={{
                                            left: pos.left,
                                            width: pos.width,
                                          }}
                                          onClick={() => handleTaskClick(issue)}
                                        >
                                          {issue.key}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="text-xs">
                                          <p className="font-bold">
                                            {issue.title}
                                          </p>
                                          <p>
                                            Status:{" "}
                                            {getStatusName(issue.status)}
                                          </p>
                                          <p>
                                            {issue.startDate
                                              ? new Date(
                                                  issue.startDate,
                                                ).toLocaleDateString()
                                              : "N/A"}{" "}
                                            -{" "}
                                            {issue.endDate
                                              ? new Date(
                                                  issue.endDate,
                                                ).toLocaleDateString()
                                              : "N/A"}
                                          </p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              );
                            })}
                          {isExpanded && sprintIssues.length === 0 && (
                            <div className="h-[37px] border-b border-transparent"></div>
                          )}
                        </div>
                      );
                    })}

                    {showUnassigned && unassignedIssues.length > 0 && (
                      <div>
                        <div className="h-[37px] border-b border-transparent"></div>
                        {expandedSprints["unassigned"] &&
                          unassignedIssues.map((issue) => {
                            const pos = getTaskPosition(issue);
                            return (
                              <div
                                key={issue.id}
                                className="h-[37px] border-b border-transparent relative w-full"
                              >
                                {pos && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className="absolute h-6 top-[6px] bg-primary rounded-md shadow-sm flex items-center px-2 text-xs overflow-hidden whitespace-nowrap cursor-pointer hover:bg-primary/90"
                                        style={{
                                          left: pos.left,
                                          width: pos.width,
                                        }}
                                        onClick={() => handleTaskClick(issue)}
                                      >
                                        {issue.key}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-xs">
                                        <p className="font-bold">
                                          {issue.title}
                                        </p>
                                        <p>
                                          Status: {getStatusName(issue.status)}
                                        </p>
                                        <p>
                                          {issue.startDate
                                            ? new Date(
                                                issue.startDate,
                                              ).toLocaleDateString()
                                            : "N/A"}{" "}
                                          -{" "}
                                          {issue.endDate
                                            ? new Date(
                                                issue.endDate,
                                              ).toLocaleDateString()
                                            : "N/A"}
                                        </p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
