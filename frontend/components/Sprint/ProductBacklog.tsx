"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";

import { IssuesTable } from "@/components/List/IssuesTable";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import { isOk } from "@/error/result";
import { clientApiGet } from "@/lib/utils/clientApiClient";
import type { Collection } from "@/types/api/collection";
import type { Issue } from "@/types/api/issue";

interface ProductBacklogProps {
  projectId: string;
}

export function ProductBacklog({ projectId }: ProductBacklogProps) {
  const {
    data: issues,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["issues", "backlog", projectId],
    queryFn: async () => {
      const result = await clientApiGet<Collection<Issue>>(
        `/issues?project=${projectId}&backlog=true`,
      );

      return isOk(result) ? result.value : null;
    },
  });

  useMercureObserver({
    topics: [
      "/issues",
      `/projects/${projectId}/issues`,
      `/sprints?project=${projectId}`,
    ],
    onUpdate: () => {
      refetch();
    },
  });

  if (error) {
    return (
      <div className="text-destructive p-4 bg-background rounded-lg border border-border">
        Błąd podczas ładowania backlogu: {(error as Error).message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-background rounded-lg border border-border gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" />
        Ładowanie backlogu...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Product Backlog</h2>
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <IssuesTable issues={issues?.member || []} projectId={projectId} />
      </div>
    </div>
  );
}
