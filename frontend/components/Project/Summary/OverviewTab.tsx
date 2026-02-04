"use client";

import { AlertCircle, CheckCircle2, Clock, List } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjectOverview } from "@/hooks/useProjectOverview";
import type { Issue, IssueStatus } from "@/lib/types/api";
import { formatDateTime } from "@/lib/utils/issueUtils";

interface OverviewTabProps {
  issues: Issue[];
  statuses: IssueStatus[];
  now?: number;
}

export function OverviewTab({ issues, statuses, now }: OverviewTabProps) {
  const {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    completionPercentage,
    timeProgress,
    statusCounts,
    upcomingDeadlines,
    highPriorityTasks,
    totalLogged,
    totalEstimated,
  } = useProjectOverview({ issues, statuses, now });

  return (
    <div className="space-y-6">
      {/* Top Row: Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wszystkie zadania
            </CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukończone</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({completionPercentage}%)
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">W toku</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              Zaległe/Pilne
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {overdueTasks}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Progress & Status */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Postęp projektu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative h-12 w-full overflow-hidden rounded-lg bg-secondary">
                <div
                  className="h-full bg-primary flex items-center justify-end px- font-bold transition-all duration-500"
                  style={{ width: `${Math.min(timeProgress, 100)}%` }}
                >
                  {timeProgress > 5 && `${timeProgress}%`}
                </div>
                {timeProgress <= 5 && (
                  <div className="absolute inset-0 flex items-center justify-center font-bold">
                    {timeProgress}%
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Zarejestrowany czas: {totalLogged}h / Szacowany:{" "}
                {totalEstimated}h
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Stan zadań</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm uppercase">{status}</span>
                  </div>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Zbliżające się terminy</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kod</TableHead>
                  <TableHead>Zadanie</TableHead>
                  <TableHead>Termin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingDeadlines.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.key}</TableCell>
                    <TableCell>{issue.title}</TableCell>
                    <TableCell>
                      {issue.endDate ? (
                        <span suppressHydrationWarning>
                          {formatDateTime(issue.endDate)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {upcomingDeadlines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Brak nadchodzących terminów
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Wysoki Priorytet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highPriorityTasks.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{issue.title}</span>
                  <Badge variant="destructive">{issue.priority}</Badge>
                </div>
              ))}
              {highPriorityTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Brak zadań o wysokim priorytecie
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
