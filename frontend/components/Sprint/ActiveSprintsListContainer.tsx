import React from "react";

import type { Sprint } from "@/types/api/sprint";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { AddActiveSprintDialog } from "./AddActiveSprintDialog";
import { SprintContainer } from "./SprintContainer";

export function ActiveSprintsListContainer({
  sprints,
  accordionId,
  projectId,
  organizationId,
  hasActiveSprint,
}: {
  sprints: Sprint[];
  accordionId: string;
  projectId: string;
  organizationId: string;
  hasActiveSprint: boolean;
}) {
  const formattedSprints = sprints;

  return (
    <AccordionItem
      value={accordionId}
      className="w-full px-4 bg-background rounded-lg border border-border"
    >
      <AccordionTrigger>
        <h2 className="font-semibold text-lg">Aktywne sprinty</h2>
      </AccordionTrigger>
      <AccordionContent>
        {formattedSprints.length > 0 ? (
          <Accordion
            type="multiple"
            defaultValue={formattedSprints.map((sprint) =>
              sprint.id.toString(),
            )}
            className="grid gap-4"
          >
            {formattedSprints.map((sprint) => (
              <SprintContainer
                key={sprint.id}
                sprint={sprint}
                projectId={projectId}
                organizationId={organizationId}
                hasActiveSprint={hasActiveSprint}
              />
            ))}
          </Accordion>
        ) : (
          <>
            <div className="text-center text-gray-500 py-4">
              Brak aktywnych sprintów
            </div>
            <AddActiveSprintDialog projectId={projectId} />
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
