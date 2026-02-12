"use client";

import React, { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ViewMode } from "@/lib/types/gantt";
import type { Issue, IssueStatus } from "@/types/api/issue";
import type { Sprint } from "@/types/api/sprint";

import { GanttChart } from "./GanttChart";
import { GanttScopeButton } from "./GanttScopeButton";
import { SyncCalendarDropdown } from "./SyncCalendarDropdown";

interface GanttTabProps {
  issues: Issue[];
  sprints: Sprint[];
  statuses: IssueStatus[];
  now?: number;
  oAuthProviders?: string[];
  lastSyncedAt?: string;
}

export function GanttTab({
  issues,
  sprints,
  statuses,
  now,
  oAuthProviders,
  lastSyncedAt,
}: GanttTabProps) {
  const [selectedSprintId, setSelectedSprintId] = useState<string>("all");

  const [viewMode, setViewMode] = useState<ViewMode>("week");

  return (
    <div className="space-y-4 bg-background p-4 rounded-lg border border-border">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Wybierz Sprint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {sprints.map((sprint) => (
                <SelectItem key={sprint["@id"]} value={sprint["@id"]}>
                  {sprint.name}
                </SelectItem>
              ))}
              <SelectItem value="unassigned">Nieprzypisane</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-md">
          <GanttScopeButton
            isActive={viewMode === "day"}
            label="Dzień"
            scope="day"
            onClick={() => setViewMode("day")}
          />
          <GanttScopeButton
            isActive={viewMode === "week"}
            label="Tydzień"
            scope="week"
            onClick={() => setViewMode("week")}
          />
          <GanttScopeButton
            isActive={viewMode === "month"}
            label="Miesiąc"
            scope="month"
            onClick={() => setViewMode("month")}
          />
        </div>
      </div>

      <GanttChart
        issues={issues}
        sprints={sprints}
        statuses={statuses}
        now={now}
        selectedSprintId={selectedSprintId}
        viewMode={viewMode}
      />

      <div className="flex justify-end">
        <SyncCalendarDropdown
          issueIds={issues.map((issue) => issue.id)}
          oAuthProviders={oAuthProviders}
          lastSyncedAt={lastSyncedAt}
        />
      </div>
    </div>
  );
}
