"use server";

import type { Collection } from "@/types/api/collection";
import type { IssueStatus } from "@/types/api/issue";

import { apiGet } from "./apiClient";

/**
 * Fetches issue statuses from the API and returns an array of status values
 * @param requireAuth - Whether authentication is required (default: true)
 * @returns Array of status values (e.g., ["TODO", "IN_PROGRESS", "READY"])
 */
export async function getIssueStatuses(
  requireAuth: boolean = true,
): Promise<string[]> {
  const { data, error } = await apiGet<Collection<IssueStatus>>(
    "/issue_statuses",
    requireAuth,
  );

  if (error) {
    console.error("Failed to fetch issue statuses:", error);
    return [];
  }

  if (!data || !data.member) {
    return [];
  }

  return data.member.map((status) => status.value);
}

/**
 * Fetches full issue status objects from the API
 * @param projectId - Optional project ID to filter statuses
 * @param requireAuth - Whether authentication is required (default: true)
 * @returns Array of IssueStatus objects
 */
export async function getIssueStatusObjects(
  projectId?: string | number,
  requireAuth: boolean = true,
): Promise<IssueStatus[]> {
  const url = projectId
    ? `/issue_statuses?project=${projectId}`
    : "/issue_statuses";
  const { data, error } = await apiGet<Collection<IssueStatus>>(
    url,
    requireAuth,
  );

  if (error) {
    console.error("Failed to fetch issue statuses:", error);
    return [];
  }

  if (!data || !data.member) {
    return [];
  }

  return data.member;
}

/**
 * Creates a mapping from status IRI to status value
 * @param projectId - Optional project ID to filter statuses
 * @param requireAuth - Whether authentication is required (default: true)
 * @returns Map of status IRI to status value (e.g., { "/issue_statuses/1": "TODO" })
 */
export async function getIssueStatusMap(
  projectId?: string | number,
  requireAuth: boolean = true,
): Promise<Map<string, string>> {
  const statuses = await getIssueStatusObjects(projectId, requireAuth);
  const statusMap = new Map<string, string>();

  statuses.forEach((status) => {
    if (status["@id"]) {
      statusMap.set(status["@id"], status.value);
    }
  });

  return statusMap;
}
