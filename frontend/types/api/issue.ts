import type { Attachment, Tag } from "./issue-metadata";
import type { IssueSprint } from "./sprint";
import type { UserWithOnlyEmailAndName } from "./user";

export interface IssueReference extends Omit<Issue, "parentIssue"> {
  parentIssue?: string;
}

export interface Issue {
  "@id": string;
  "@type": "Issue";
  "@context"?: "/contexts/Issue";
  id: number;
  key: string;
  title: string;
  estimated?: number;
  loggedTime?: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  type: string;
  project: string;
  reporter: UserWithOnlyEmailAndName;
  assignees: UserWithOnlyEmailAndName[];
  parentIssue?: IssueReference;
  priority: string;
  resolution?: string;
  startDate?: string;
  endDate?: string;
  relatedIssues?: string[];
  relatedByIssues?: string[];
  children?: string[];
  issueSprints?: IssueSprint[];
  issueTags?: string[];
  attachments?: string[];
}

export interface IssueDetails
  extends Omit<
    Issue,
    | "relatedIssues"
    | "relatedByIssues"
    | "children"
    | "issueSprints"
    | "issueTags"
    | "attachments"
    | "status"
    | "type"
    | "resolution"
  > {
  relatedIssues?: IssueReference[];
  relatedByIssues?: IssueReference[];
  children?: IssueReference[];
  issueSprints?: IssueSprint[];
  issueTags?: IssueTag[];
  attachments?: Attachment[];
  status: IssueStatus | string;
  type: IssueType | string;
  resolution?: IssueResolution | string;
}

export interface IssueStatus {
  "@id": string;
  "@type": "IssueStatus";
  "@context"?: "/contexts/IssueStatus";
  id: number;
  value: string;
}

export interface IssueType {
  "@id": string;
  "@type": "IssueType";
  "@context"?: "/contexts/IssueType";
  id: number;
  value: string;
}

export interface IssueResolution {
  "@id": string;
  id: number;
  value: string;
}

export interface IssueTag {
  "@type": "IssueTag";
  "@id": string;
  tag: Omit<Tag, "@context" | "issueTags">;
}
