"use server";

import { getOrRefreshAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import { getApiUrl } from "@/utils/get-api-url";

export type SearchResults = {
  issues: Array<{
    id: number;
    title: string;
    key: string;
    type: string;
    projectName: string;
    projectId: number;
    organizationId: number;
  }>;
  projects: Array<{
    id: number;
    name: string;
    organizationName: string;
    organizationId: number;
  }>;
  organizations: Array<{ id: number; name: string }>;
  chats: Array<{
    id: number;
    name: string;
    organizationId: number;
    organizationName: string;
  }>;
  users: Array<{ id: number; email: string; username: string }>;
};

export async function searchGlobal(query: string): Promise<SearchResults> {
  const emptyResults: SearchResults = {
    issues: [],
    projects: [],
    organizations: [],
    chats: [],
    users: [],
  };

  if (!query.trim()) {
    return emptyResults;
  }

  try {
    const nextApiUrl = getApiUrl();
    if (!nextApiUrl) {
      handleApiError(new Error("NEXT_PUBLIC_API_URL is not set"), "Search");
      return emptyResults;
    }

    const token = await getOrRefreshAccessToken(nextApiUrl);
    if (!token) {
      handleApiError(new Error("Unauthorized"), "Search");
      return emptyResults;
    }

    const response = await fetch(
      `${nextApiUrl}/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      handleApiError(
        new Error(`Search API error: ${response.statusText}`),
        "Search",
      );
      return emptyResults;
    }

    const data = await response.json();
    return data as SearchResults;
  } catch (error) {
    handleApiError(error, "Search");
    return emptyResults;
  }
}
