import type { Issue } from "@/types/api/issue";

import type { ViewMode } from "../types/gantt";

interface TimelineConfig {
  days: number;
  step: number;
  labelFormat: (d: Date) => string;
  headerLabel: string;
}

export const useGanttTimeline = (viewMode: ViewMode, now?: number) => {
  const startDate = now ? new Date(now) : new Date();
  startDate.setDate(startDate.getDate() - 7);

  const getTimelineConfig = (): TimelineConfig => {
    switch (viewMode) {
      case "day":
        return {
          days: 14,
          step: 1,
          labelFormat: (d: Date) =>
            d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" }),
          headerLabel: "Dzień",
        };
      case "week":
        return {
          days: 56,
          step: 7,
          labelFormat: (d: Date) => {
            const end = new Date(d);
            end.setDate(d.getDate() + 6);
            return `${d.getDate()}.${d.getMonth() + 1} - ${end.getDate()}.${end.getMonth() + 1}`;
          },
          headerLabel: "Tydzień",
        };
      case "month":
        return {
          days: 180,
          step: 30,
          labelFormat: (d: Date) =>
            d.toLocaleDateString("pl-PL", { month: "long", year: "numeric" }),
          headerLabel: "Miesiąc",
        };
    }
  };

  const config = getTimelineConfig();
  const columns = Array.from({
    length: Math.ceil(config.days / config.step),
  }).map((_, i) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + i * config.step);
    const end = new Date(start);
    end.setDate(end.getDate() + config.step - 1);
    return { start, end, label: config.labelFormat(start) };
  });

  const getTaskPosition = (issue: Issue) => {
    if (!issue.startDate && !issue.endDate) {
      return null;
    }

    const taskStart = issue.startDate ? new Date(issue.startDate) : new Date();
    const taskEnd = issue.endDate
      ? new Date(issue.endDate)
      : new Date(taskStart);

    if (taskEnd.getTime() === taskStart.getTime()) {
      taskEnd.setDate(taskEnd.getDate() + 1);
    }

    const timelineStart = columns[0].start.getTime();
    const timelineEnd = columns[columns.length - 1].end.getTime();
    const totalDuration = timelineEnd - timelineStart;

    const left = ((taskStart.getTime() - timelineStart) / totalDuration) * 100;
    const width =
      ((taskEnd.getTime() - taskStart.getTime()) / totalDuration) * 100;

    if (left + width < 0 || left > 100) {
      return null;
    }

    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.min(100 - Math.max(0, left), width)}%`,
    };
  };

  return {
    columns,
    getTaskPosition,
    config,
  };
};
