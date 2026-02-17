"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useMercureObserver } from "@/hooks/useMercureObserver";
import { clientApiGet } from "@/services/fetch/client-api-service";
import type { Collection } from "@/types/api/collection";
import type { Sprint } from "@/types/api/sprint";
import { isOk } from "@/utils/result";

import { Accordion } from "../ui/accordion";
import { ActiveSprintsListContainer } from "./ActiveSprintsListContainer";
import { SprintsListContainer } from "./SprintsListContainer";

interface SprintsListProps {
  initialSprints: Collection<Sprint> | null;
  projectId: string;
  organizationId: string;
}

export function SprintsList({
  initialSprints,
  projectId,
  organizationId,
}: SprintsListProps) {
  const {
    data: sprintsResult,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: async () => {
      console.log("useQuery queryFn EXECUTING");
      return await clientApiGet<Collection<Sprint>>(
        `/sprints?project=${projectId}`,
      );
    },
  });

  const queryClient = useQueryClient();

  useMercureObserver({
    topics: [`/sprints?project=${projectId}`],
    onUpdate: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    },
  });

  const sprints =
    sprintsResult && isOk(sprintsResult) ? sprintsResult.value : initialSprints;

  const { created, started, completed, archived } = segragateSprintsByStatus(
    sprints?.member || [],
  );

  const hasActiveSprint = started.length > 0;

  console.log("Rendering SprintsList:", {
    sprints,
    isLoading,
    error,
    isFetching,
    created,
    started,
    completed,
  });

  return sprints?.totalItems && sprints?.totalItems > 0 ? (
    <Accordion
      type="multiple"
      defaultValue={["sprints-1", "sprints-2"]}
      className="grid gap-2"
    >
      <ActiveSprintsListContainer
        sprints={started}
        accordionId="sprints-1"
        projectId={projectId}
        organizationId={organizationId}
        hasActiveSprint={hasActiveSprint}
      />
      {created.length > 0 && (
        <SprintsListContainer
          sprints={created}
          accordionId="sprints-2"
          projectId={projectId}
          organizationId={organizationId}
          hasActiveSprint={hasActiveSprint}
        />
      )}
      {completed.length > 0 && (
        <SprintsListContainer
          sprints={completed}
          accordionId="sprints-3"
          projectId={projectId}
          organizationId={organizationId}
          hasActiveSprint={hasActiveSprint}
        />
      )}
      {archived.length > 0 && (
        <SprintsListContainer
          sprints={archived}
          accordionId="sprints-4"
          projectId={projectId}
          organizationId={organizationId}
          hasActiveSprint={hasActiveSprint}
          sprintType="Archived"
        />
      )}
    </Accordion>
  ) : (
    <NoSprintsMessage />
  );
}

function NoSprintsMessage() {
  return (
    <div className="col-span-full text-center text-disabled p-4">
      Brak sprintów do wyświetlenia
    </div>
  );
}

function segragateSprintsByStatus(sprints: Sprint[]) {
  const created: Sprint[] = [];
  const started: Sprint[] = [];
  const completed: Sprint[] = [];
  const archived: Sprint[] = [];

  sprints.forEach((sprint) => {
    if (sprint.isArchived) {
      archived.push(sprint);
      return;
    }

    switch (sprint.status) {
      case "created":
        created.push(sprint);
        break;
      case "started":
        started.push(sprint);
        break;
      case "completed":
        completed.push(sprint);
        break;
      default:
        break;
    }
  });

  return { created, started, completed, archived };
}
