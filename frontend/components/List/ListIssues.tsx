"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";

import { isOk } from "@/error/result";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import { clientApiGet } from "@/lib/utils/clientApiClient";
import { useIssuesOptions } from "@/store/IssuesOptionsContext";
import type { Collection } from "@/types/api/collection";
import type { Issue } from "@/types/api/issue";
import { buildQueryParams } from "@/utils/query-params-builder";

import { IssuesTable } from "./IssuesTable";

interface ListIssuesProps {
  projectId: string;
}

export function ListIssues({ projectId }: ListIssuesProps) {
  const issuesOptions = useIssuesOptions();
  const sortOptions = issuesOptions?.sortOptions || [];
  const filterOptions = issuesOptions?.filterOptions || [];
  const queryClient = useQueryClient();

  useMercureObserver<Issue>({
    topics: [`/projects/${projectId}/issues`],
    onUpdate: async () => {
      console.log("ListIssues: Received Mercure update, invalidating queries");
      await queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  // Fetch issues with React Query
  const {
    data: issues,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "issues",
      projectId,
      JSON.stringify(sortOptions),
      JSON.stringify(filterOptions),
    ],
    queryFn: async () => {
      const queryParams = buildQueryParams(
        projectId,
        sortOptions,
        filterOptions,
      );
      const result = await clientApiGet<Collection<Issue>>(
        `/issues?${queryParams}`,
      );
      return result && isOk(result) ? result.value : null;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  if (error) {
    return (
      <div className="col-span-full text-center text-destructive p-4 bg-background rounded-lg border border-border">
        Błąd podczas ładowania zadań: {(error as Error).message}
      </div>
    );
  }

  if (isLoading && !issues) {
    return (
      <div className="col-span-full text-center p-8 bg-background text-disabled rounded-lg border border-border flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" />
        Ładowanie zadań...
      </div>
    );
  }

  return <IssuesTable issues={issues?.member || []} projectId={projectId} />;
}
