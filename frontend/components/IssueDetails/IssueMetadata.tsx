import React from "react";

import { formatDateTime } from "@/lib/utils/issueUtils";

import { InfoRow } from "./InfoRow";
import type { IssueDetails } from "./types";

export function IssueMetadata({ issue }: { issue: IssueDetails }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground ms-auto">
      <InfoRow label="Utworzono" value={formatDateTime(issue.createdAt)} />
      <span>|</span>
      <InfoRow
        label="Ostatnia modyfikacja"
        value={formatDateTime(issue.updatedAt)}
      />
      <span>|</span>
      <InfoRow
        label="Zgłaszający"
        value={issue.reporter?.username || issue.reporter?.email || "Nieznany"}
      />
    </div>
  );
}
