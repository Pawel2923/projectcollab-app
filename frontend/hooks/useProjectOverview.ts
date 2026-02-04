import { useCallback, useMemo } from "react";

import type { Issue, IssueStatus } from "@/lib/types/api";

interface UseProjectOverviewProps {
  issues: Issue[];
  statuses: IssueStatus[];
  now?: number;
}

export function useProjectOverview({
  issues,
  statuses,
  now,
}: UseProjectOverviewProps) {
  const statusMap = useMemo(
    () =>
      statuses.reduce(
        (acc, status) => {
          acc[status["@id"]] = status.value;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [statuses],
  );

  const getStatusName = useCallback(
    (iri: string) => {
      return statusMap[iri] || iri.split("/").pop() || "Unknown";
    },
    [statusMap],
  );

  const totalTasks = issues.length;

  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;
    let tLogged = 0;
    let tEstimated = 0;
    const statusCounts: Record<string, number> = {};
    const highPriority: Issue[] = [];
    const withDeadlines: Issue[] = [];

    const nowTime = now || Date.now();

    for (const i of issues) {
      const statusName = getStatusName(i.status);
      const statusLower = statusName.toLowerCase();

      statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;

      const isDone = [
        "done",
        "completed",
        "closed",
        "zakończone",
        "gotowe",
        "ready",
      ].includes(statusLower);

      if (isDone) completed++;

      if (
        ["in_progress", "in progress", "w toku", "realizacja"].includes(
          statusLower,
        )
      ) {
        inProgress++;
      }

      if (i.endDate) {
        if (new Date(i.endDate).getTime() < nowTime && !isDone) {
          overdue++;
        }
        withDeadlines.push(i);
      }

      tLogged += i.loggedTime || 0;
      tEstimated += i.estimated || 0;

      if (["high", "critical", "urgent"].includes(i.priority.toLowerCase())) {
        highPriority.push(i);
      }
    }

    const cPercentage =
      totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    const tProgress =
      tEstimated > 0 ? Math.round((tLogged / tEstimated) * 100) : 0;

    const deadlines = withDeadlines
      .sort(
        (a, b) =>
          new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime(),
      )
      .slice(0, 5);

    return {
      completedTasks: completed,
      inProgressTasks: inProgress,
      overdueTasks: overdue,
      completionPercentage: cPercentage,
      timeProgress: tProgress,
      statusCounts,
      upcomingDeadlines: deadlines,
      highPriorityTasks: highPriority,
      totalLogged: tLogged,
      totalEstimated: tEstimated,
    };
  }, [issues, getStatusName, totalTasks, now]);

  return { ...stats, totalTasks };
}
