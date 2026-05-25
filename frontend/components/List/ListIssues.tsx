"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";

import { useMercureObserver } from "@/hooks/useMercureObserver";
import { clientApiGet } from "@/services/fetch/client-api-service";
import { fetchApiLog } from "@/services/log/fetch-api-log";
import { useIssuesOptions } from "@/store/IssuesOptionsContext";
import type { Collection } from "@/types/api/collection";
import type { Issue } from "@/types/api/issue";
import { buildQueryParams } from "@/utils/query-params-builder";
import { isOk } from "@/utils/result";

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
      fetchApiLog({
        level: "debug",
        message: "ListIssues received Mercure update",
        serviceName: "ListIssues",
        context: {
          projectId,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  useEffect(() => {
    fetchApiLog({
      level: "debug",
      message: "ListIssues render state",
      serviceName: "ListIssues",
      context: {
        projectId,
        sortOptions,
        filterOptions,
      },
    });
  }, [filterOptions, projectId, sortOptions]);

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
