"use client";

import { Inbox } from "lucide-react";
import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Issue } from "@/types/api/issue";

import { IssueRow } from "./IssueRow";

interface IssuesTableProps {
  issues: Issue[];
  projectId: string;
}

export function IssuesTable({ issues, projectId }: IssuesTableProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

  const toggleExpand = (issueId: number) => {
    setExpandedIssues((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

  // Organize issues into hierarchy
  const organizeIssues = (
    allIssues: Issue[],
  ): { topLevel: Issue[]; childrenMap: Map<string, Issue[]> } => {
    const topLevel: Issue[] = [];
    const childrenMap = new Map<string, Issue[]>();

    allIssues.forEach((issue) => {
      if (issue.parentIssue) {
        const parentIri =
          typeof issue.parentIssue === "string"
            ? issue.parentIssue
            : issue.parentIssue["@id"];

        if (parentIri) {
          const children = childrenMap.get(parentIri) || [];
          children.push(issue);
          childrenMap.set(parentIri, children);
        }
      } else {
        topLevel.push(issue);
      }
    });

    return { topLevel, childrenMap };
  };

  if (!issues || issues.length === 0) {
    return (
      <div className="col-span-full text-center text-disabled p-8 bg-background rounded-lg border border-border">
        <div className="flex flex-col items-center gap-2">
          <Inbox size={48} />
          <p>Brak zadań do wyświetlenia</p>
        </div>
      </div>
    );
  }

  const { topLevel, childrenMap } = organizeIssues(issues);

  const renderIssueWithChildren = (issue: Issue, depth: number = 0) => {
    const children = childrenMap.get(issue["@id"] || "") || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedIssues.has(issue.id);

    return (
      <React.Fragment key={issue.id}>
        <IssueRow
          issue={issue}
          depth={depth}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleExpand(issue.id)}
          projectId={projectId}
        />
        {hasChildren &&
          isExpanded &&
          children.map((child) => renderIssueWithChildren(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-200 hover:bg-gray-200">
          <TableHead className="w-30 px-4">Zadanie</TableHead>
          <TableHead className="px-4">Tytuł</TableHead>
          <TableHead className="w-30 px-4">Status</TableHead>
          <TableHead className="w-30 px-4">Priorytet</TableHead>
          <TableHead className="w-30 px-4">Termin</TableHead>
          <TableHead className="w-38 px-4">Osoby przypisane</TableHead>
          <TableHead className="w-38 px-4">Osoba zgłaszająca</TableHead>
          <TableHead className="w-30 px-4">Rozwiązano</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topLevel.map((issue) => renderIssueWithChildren(issue))}
      </TableBody>
    </Table>
  );
}
