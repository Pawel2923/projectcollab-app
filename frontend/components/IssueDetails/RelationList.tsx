import React from "react";

import type { IssueReference } from "@/types/api/issue";

import { EmptyRelationCopy } from "./EmptyRelationCopy";
import { RelationItem } from "./RelationItem";

type RelationListProps = {
  references: IssueReference[];
  organizationId: string;
  projectId: string;
  emptyMessage: string;
};

export function RelationList({
  references,
  organizationId,
  projectId,
  emptyMessage,
}: RelationListProps) {
  if (!references || references.length === 0) {
    return <EmptyRelationCopy message={emptyMessage} />;
  }

  return (
    <ul className="space-y-2">
      {references.map((reference) => (
        <li key={referenceKey(reference)}>
          <RelationItem
            organizationId={organizationId}
            projectId={projectId}
            reference={reference}
          />
        </li>
      ))}
    </ul>
  );
}

function referenceKey(reference: IssueReference) {
  return (
    reference["@id"] ||
    (reference.id ? String(reference.id) : undefined) ||
    reference.key ||
    reference.title ||
    JSON.stringify(reference)
  );
}
