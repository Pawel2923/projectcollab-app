import { useState } from "react";

import type { Sprint } from "../types/api";

export const useGanttState = (sprints: Sprint[]) => {
  const [expandedSprints, setExpandedSprints] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = { unassigned: true };
    sprints.forEach((s) => {
      initial[s["@id"]] = true;
    });
    return initial;
  });

  const toggleSprint = (sprintId: string) => {
    setExpandedSprints((prev) => ({
      ...prev,
      [sprintId]: !prev[sprintId],
    }));
  };

  return { expandedSprints, toggleSprint };
};
