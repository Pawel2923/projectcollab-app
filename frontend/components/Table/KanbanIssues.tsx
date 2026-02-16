"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, XCircle } from "lucide-react";
import React from "react";

import { updateIssueStatus } from "@/actions/updateIssueStatus";
import { isOk } from "@/error/result";
import { useAlert } from "@/hooks/useAlert";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import { clientApiGet } from "@/lib/utils/clientApiClient";
import { extractIdFromIri } from "@/lib/utils/iri";
import { getMessageText } from "@/services/message-mapper/message-mapper";
import { buildQueryParams } from "@/lib/utils/queryParamsBuilder";
import { useIssuesOptions } from "@/store/IssuesOptionsContext";
import type { Collection } from "@/types/api/collection";
import type { Issue, IssueStatus } from "@/types/api/issue";

import { KanbanColumn } from "./KanbanColumn";
import { useKanbanSensors } from "./useKanbanSensors";

interface KanbanIssuesProps {
  initialIssues: Collection<Issue> | null;
  projectId: string;
  issueStatuses: IssueStatus[];
}

export function KanbanIssues({ projectId, issueStatuses }: KanbanIssuesProps) {
  const sensors = useKanbanSensors();
  const issuesOptions = useIssuesOptions();
  const queryClient = useQueryClient();
  const { notify } = useAlert();
  const sortOptions = issuesOptions?.sortOptions || [];
  const filterOptions = issuesOptions?.filterOptions || [];

  useMercureObserver<Issue>({
    topics: [`/projects/${projectId}/issues`],
    onUpdate: async () => {
      console.log(
        "KanbanIssues: Received Mercure update, invalidating queries",
      );
      await queryClient.invalidateQueries({
        queryKey: ["issues"],
        exact: false,
      });
    },
  });

  console.log("KanbanIssues render - filterOptions:", filterOptions);
  console.log("KanbanIssues render - sortOptions:", sortOptions);
  console.log("KanbanIssues render - queryKey will be:", [
    "issues",
    projectId,
    JSON.stringify(sortOptions),
    JSON.stringify(filterOptions),
  ]);

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

  const filterIssuesByStatusIri = (statusIri: string): Collection<Issue> => {
    if (!issues) {
      return {
        "@context": "/contexts/Issue",
        "@id": "/issues",
        "@type": "Collection",
        totalItems: 0,
        member: [],
      };
    }

    const filteredIssues = issues.member.filter(
      (issue) => issue.status === statusIri,
    );

    return {
      "@context": issues["@context"],
      "@id": issues["@id"],
      "@type": "Collection",
      totalItems: filteredIssues.length,
      member: filteredIssues,
    };
  };

  if (error) {
    return (
      <div className="col-span-full text-center text-destructive p-4">
        Błąd podczas ładowania zadań: {(error as Error).message}
      </div>
    );
  }

  if (isLoading && !issues) {
    return (
      <div className="col-span-full text-center text-disabled p-4 flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" />
        Ładowanie zadań...
      </div>
    );
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const issueIri = active.id as string;
    const newStatusIri = over.id as string;

    // Find the issue to check its current status
    const issue = issues?.member.find((i) => i["@id"] === issueIri);

    if (!issue || issue.status === newStatusIri) {
      return;
    }

    const issueId = extractIdFromIri(issueIri);
    const statusId = extractIdFromIri(newStatusIri);

    if (!issueId || !statusId) {
      return;
    }

    const result = await updateIssueStatus(issueId, statusId);

    if (result.ok) {
      await queryClient.invalidateQueries({ queryKey: ["issues"] });
      notify({
        type: "default",
        title: "Status zadania został zaktualizowany",
        icon: <AlertCircle />,
        hasCloseButton: true,
        duration: 8000,
      });
    } else {
      const errorMessage =
        result.message ||
        (result.code ? getMessageText(result.code) : undefined) ||
        "Nie udało się zaktualizować statusu zadania";

      notify({
        type: "destructive",
        title: errorMessage,
        icon: <XCircle />,
        hasCloseButton: true,
        duration: 8000,
      });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {issueStatuses.length > 0 ? (
        issueStatuses.map((status) => (
          <KanbanColumn
            key={status["@id"]}
            issues={filterIssuesByStatusIri(status["@id"] || "")}
            title={status.value}
            statusIri={status["@id"]}
          />
        ))
      ) : (
        <div className="col-span-full text-center text-disabled p-4">
          Nie znaleziono statusów zadań
        </div>
      )}
    </DndContext>
  );
}
