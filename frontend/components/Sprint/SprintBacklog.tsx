"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";

import { IssuesTable } from "@/components/List/IssuesTable";
import { isOk } from "@/error/result";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import { clientApiGet } from "@/lib/utils/clientApiClient";
import type { Collection } from "@/types/api/collection";
import type { Issue } from "@/types/api/issue";
import type { Sprint } from "@/types/api/sprint";

interface SprintBacklogProps {
  sprint: Sprint;
  projectId: string;
}

export function SprintBacklog({ sprint, projectId }: SprintBacklogProps) {
  const {
    data: issues,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["issues", "sprint", sprint.id],
    queryFn: async () => {
      const sprintIri = sprint["@id"];
      const result = await clientApiGet<Collection<Issue>>(
        `/issues?issueSprints.sprint=${sprintIri}`,
      );
      return result && isOk(result) ? result.value : null;
    },
  });

  const queryClient = useQueryClient();

  useMercureObserver({
    topics: [
      "/issues",
      `/projects/${projectId}/issues`,
      `/sprints?project=${projectId}`,
    ],
    onUpdate: () => {
      queryClient.invalidateQueries({
        queryKey: ["issues", "sprint", sprint.id],
      });
    },
  });

  if (error) {
    return (
      <div className="text-destructive p-4">
        Błąd podczas ładowania zadań sprintu: {(error as Error).message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={16} />
        Ładowanie zadań...
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Zadania w sprincie</h4>
      <IssuesTable issues={issues?.member || []} projectId={projectId} />
    </div>
  );
}
