"use server";

import { getAccessToken } from "@/services/auth/token-service";
import { getServerApiUrl } from "@/utils/server-api-url";

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
    const nextApiUrl = getServerApiUrl();
    if (!nextApiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      return emptyResults;
    }

    const token = await getAccessToken(nextApiUrl);
    if (!token) {
      console.error("No access token available for search");
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
      console.error(`Search failed with status: ${response.status}`);
      return emptyResults;
    }

    const data = await response.json();
    return data as SearchResults;
  } catch (error) {
    console.error("Search error:", error);
    return emptyResults;
  }
}
