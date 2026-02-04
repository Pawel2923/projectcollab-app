import Link from "next/link";
import React from "react";

import type { IssueReference } from "@/lib/types/api";
import { extractIdFromIri } from "@/lib/utils/iri";

type RelationItemProps = {
  reference: IssueReference;
  organizationId: string;
  projectId: string;
};

export function RelationItem({
  reference,
  organizationId,
  projectId,
}: RelationItemProps) {
  const relationIri = reference["@id"];
  const extractedId = extractIdFromIri(relationIri);
  const fallbackId =
    typeof reference.id === "number" || typeof reference.id === "string"
      ? String(reference.id)
      : undefined;

  const targetIssueId = extractedId || fallbackId;
  const href = targetIssueId
    ? `/organizations/${organizationId}/projects/${projectId}/issues/${targetIssueId}`
    : undefined;
  const label = relationLabel(reference);

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground transition hover:bg-muted/60"
      >
        <span>{label}</span>
        <span className="text-xs text-muted-foreground">Przejdź</span>
      </Link>
    );
  }

  return (
    <span className="inline-block w-full rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
      {label}
    </span>
  );
}

function relationLabel(reference: IssueReference) {
  if (reference.key && reference.title) {
    return `${reference.key} – ${reference.title}`;
  }

  if (reference.title) {
    return reference.title;
  }

  if (reference.key) {
    return reference.key;
  }

  if (reference.id) {
    return `Zadanie ${reference.id}`;
  }

  return reference["@id"] || "Nieznane zadanie";
}
