import React from "react";

import type { Sprint } from "@/lib/types/api";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { SprintContainer } from "./SprintContainer";
import { getStatusName } from "./sprintUtils";

interface SprintsListContainerProps {
  sprints: Sprint[];
  accordionId: string;
  sprintType?: "created" | "completed" | string;
  projectId: string;
  organizationId: string;
  hasActiveSprint: boolean;
}

export function SprintsListContainer({
  sprints,
  accordionId,
  sprintType,
  projectId,
  organizationId,
  hasActiveSprint,
}: SprintsListContainerProps) {
  const status = getStatusName(sprintType || sprints[0]?.status);
  const formattedSprints = sprints;

  const sprintAccordionIds = formattedSprints.map((sprint) =>
    sprint.id.toString(),
  );

  return (
    <AccordionItem
      value={accordionId}
      className="w-full px-4 bg-background rounded-lg border border-border"
    >
      <AccordionTrigger>
        <h2 className="font-semibold text-lg">{status}</h2>
      </AccordionTrigger>
      <AccordionContent>
        <Accordion
          type="multiple"
          defaultValue={sprintAccordionIds}
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
      </AccordionContent>
    </AccordionItem>
  );
}
