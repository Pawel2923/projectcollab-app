import { useCallback } from "react";

import { fetchApiLog } from "@/services/log/fetch-api-log";
import type { Project } from "@/types/api/project";

const STORAGE_KEY = "projectcollab:recent-projects";
const MAX_RECENT_PROJECTS = 10;

export function useRecentProjects() {
  const sortProjectsByRecency = useCallback((projects: Project[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return projects;
      }

      const recentIds: number[] = JSON.parse(stored);
      const recentMap = new Map(recentIds.map((id, index) => [id, index]));

      return [...projects].sort((a, b) => {
        const indexA = recentMap.has(a.id) ? recentMap.get(a.id)! : Infinity;
        const indexB = recentMap.has(b.id) ? recentMap.get(b.id)! : Infinity;
        return indexA - indexB;
      });
    } catch (e) {
      fetchApiLog({
        level: "error",
        message: "Failed to sort projects",
        serviceName: "useRecentProjects",
        context: {
          error: e,
        },
      });
      return projects;
    }
  }, []);

  const addRecentProject = useCallback((projectId: number) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let recentIds: number[] = stored ? JSON.parse(stored) : [];
      recentIds = recentIds.filter((id) => id !== projectId);
      recentIds.unshift(projectId);
      recentIds = recentIds.slice(0, MAX_RECENT_PROJECTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds));
    } catch (e) {
      fetchApiLog({
        level: "error",
        message: "Failed to save recent project",
        serviceName: "useRecentProjects",
        context: {
          error: e,
          projectId,
        },
      });
    }
  }, []);

  return { sortProjectsByRecency, addRecentProject };
}
