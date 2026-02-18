import type { Issue, IssueStatus } from "@/types/api/issue";
import type { Sprint } from "@/types/api/sprint";

export const useGanttData = (
  issues: Issue[],
  sprints: Sprint[],
  statuses: IssueStatus[],
  selectedSprintId: string,
) => {
  const statusMap = statuses.reduce(
    (acc, status) => {
      acc[status["@id"]] = status.value;
      return acc;
    },
    {} as Record<string, string>,
  );

  const getStatusName = (iri: string) => {
    return statusMap[iri] || iri.split("/").pop() || "Unknown";
  };

  const issuesBySprint: Record<string, Issue[]> = {};
  const unassignedIssues: Issue[] = [];

  issues.forEach((issue) => {
    if (issue.issueSprints && issue.issueSprints.length > 0) {
      issue.issueSprints.forEach((issueSprint) => {
        if (issueSprint.sprint) {
          const sprintIri =
            typeof issueSprint.sprint === "string"
              ? issueSprint.sprint
              : issueSprint.sprint["@id"];

          if (!issuesBySprint[sprintIri]) {
            issuesBySprint[sprintIri] = [];
          }
          issuesBySprint[sprintIri].push(issue);
        }
      });
    } else {
      unassignedIssues.push(issue);
    }
  });

  const filteredSprints =
    selectedSprintId === "all"
      ? sprints
      : sprints.filter((s) => s["@id"] === selectedSprintId);

  const showUnassigned =
    selectedSprintId === "all" || selectedSprintId === "unassigned";

  return {
    issuesBySprint,
    unassignedIssues,
    filteredSprints,
    showUnassigned,
    getStatusName,
  };
};
