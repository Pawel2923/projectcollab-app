import React, { useState } from "react";

import type { IssueDetails } from "@/types/api/issue";

import { IssueSelector } from "../Issue/IssueSelector";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Label } from "../ui/label";
import { RelationList } from "./RelationList";

interface IssueRelationsProps {
  organizationId: string;
  projectId: string;
  issue: IssueDetails;
}

export function IssueRelations({
  organizationId,
  projectId,
  issue,
}: IssueRelationsProps) {
  const [parentIssueIri, setParentIssueIri] = useState<string>(
    issue.parentIssue?.["@id"] || "",
  );
  const [relatedIssuesIris, setRelatedIssuesIris] = useState<string[]>(
    (issue.relatedIssues || []).map((ri) => ri["@id"] || "").filter(Boolean),
  );

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label withoutControls>Zadanie nadrzędne</Label>
          <IssueSelector
            name="parentIssue"
            organizationId={organizationId}
            projectId={projectId}
            value={parentIssueIri}
            onChange={(value) => setParentIssueIri(value as string)}
            placeholder="Wybierz zadanie nadrzędne"
            excludeIssueId={String(issue.id)}
          />
          <input type="hidden" name="parentIssue" value={parentIssueIri} />
        </div>

        <div className="grid gap-2">
          <Label withoutControls>Powiązane zadania</Label>
          <IssueSelector
            name="relatedIssues"
            organizationId={organizationId}
            projectId={projectId}
            value={relatedIssuesIris}
            onChange={(value) => setRelatedIssuesIris(value as string[])}
            multiple
            placeholder="Wybierz powiązane zadania"
            excludeIssueId={String(issue.id)}
          />
          {relatedIssuesIris.map((issueIri, index) => (
            <input
              key={index}
              type="hidden"
              name="relatedIssues"
              value={issueIri}
            />
          ))}
        </div>
      </div>

      <Accordion type="multiple">
        <AccordionItem value="children" className="border-b-0">
          <AccordionTrigger className="pt-0 pb-2">
            Zadania podrzędne
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <RelationList
              organizationId={organizationId}
              projectId={projectId}
              references={issue.children || []}
              emptyMessage="Brak powiązanych zadań podrzędnych"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="multiple">
        <AccordionItem value="relatedBy" className="border-b-0">
          <AccordionTrigger className="pt-0 pb-2">
            Powiązania odwrotne
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <RelationList
              organizationId={organizationId}
              projectId={projectId}
              references={issue.relatedByIssues || []}
              emptyMessage="Brak powiązań odwrotnych"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
