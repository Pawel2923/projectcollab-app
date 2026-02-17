"use server";

import { apiGet } from "@/services/fetch/api-service";
import type { Collection } from "@/types/api/collection";
import type { IssueStatus } from "@/types/api/issue";

/**
 * Fetches full issue status objects from the API
 * @param projectId - Optional project ID to filter statuses
 * @param requireAuth - Whether authentication is required (default: true)
 * @returns Array of IssueStatus objects
 */
export async function fetchIssueStatusObjects(
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
