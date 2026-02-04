import type { NavigationItem } from "@/components/SideNav/types";

export interface Collection<T> {
  "@context": string;
  "@id": string;
  "@type": "Collection";
  totalItems: number;
  member: T[];
}

export interface Organization {
  "@id": string;
  "@type": "Organization";
  "@context"?: "/contexts/Organization";
  id: number;
  name: string;
}

export interface OrganizationRole {
  "@id": string;
  "@type": "OrganizationRole";
  "@context"?: "/contexts/OrganizationRole";
  id: number;
  value: string;
}

export interface OrganizationMember {
  "@id": string;
  "@type": "OrganizationMember";
  "@context"?: "/contexts/OrganizationMember";
  id: number;
  member: UserWithOnlyEmailAndName;
  organization: string;
  role: OrganizationRole;
  isBlocked: boolean;
  invitedBy?: UserWithOnlyEmailAndName;
  joinedAt: string;
}

export interface Project {
  "@id": string;
  "@type": "Project";
  "@context"?: "/contexts/Project";
  id: number;
  name: string;
  organization: Omit<Organization, "@context" | "name">;
  isArchived?: boolean;
}

export interface ProjectRole {
  "@id": string;
  "@type": "ProjectRole";
  "@context"?: "/contexts/ProjectRole";
  id: number;
  value: string;
}

export interface User {
  "@id": string;
  "@type": "User";
  "@context"?: "/contexts/User";
  id: number;
  email: string;
  roles: string[];
  username?: string;
  registeredAt?: string;
  isVerified?: boolean;
}

export type UserWithOnlyEmailAndName = Pick<
  User,
  "@id" | "@type" | "id" | "email" | "username"
>;

export interface ProjectMember {
  "@id": string;
  "@type": "ProjectMember";
  "@context"?: "/contexts/ProjectMember";
  id: number;
  member: UserWithOnlyEmailAndName;
  project: string;
  joinedAt: string;
  role: Omit<ProjectRole, "id" | "@context">;
  isBlocked?: boolean;
  invitedBy?: UserWithOnlyEmailAndName;
}

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

export interface Tag {
  "@id": string;
  "@type": "tag";
  "@context"?: "/contexts/Tag";
  id: number;
  title: string;
  backgroundColor?: string;
  textColor?: string;
  issueTags?: {
    "@type": "IssueTag";
    "@id": string;
    issue: string;
  };
}

export interface Comment {
  "@id": string;
  "@type": "Comment";
  "@context"?: "/contexts/Comment";
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  commenter?: UserWithOnlyEmailAndName;
}

export interface Sprint {
  "@id": string;
  "@type": "Sprint";
  "@context"?: "/contexts/Sprint";
  id: number;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  isArchived: boolean;
  project?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum SprintStatusEnum {
  CREATED = "created",
  STARTED = "started",
  COMPLETED = "completed",
}

export interface IssueSprint {
  "@id": string;
  "@type": "IssueSprint";
  "@context"?: "/contexts/IssueSprint";
  id: number;
  issue?: string | Issue;
  sprint: Sprint | string | null;
  addedAt: string;
  completedInSprint: boolean;
  isArchived: boolean;
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

export interface Attachment {
  "@id": string;
  "@type": "Attachment";
  id: number;
  type: string;
  path: string;
  uploadedAt: string;
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

export interface Chat {
  "@id": string;
  "@type": "Chat";
  "@context"?: "/contexts/Chat";
  id: number;
  name: string;
  type: string;
  organization: string;
  project?: string;
  issue?: string;
  sprint?: string;
  chatMembers?: ChatMember[];
  createdAt?: string;
  lastMessageAt?: string;
}

export interface ChatLinkedProjectResources {
  project: Project;
  members: ProjectMember[];
  sprints: Sprint[];
  issues: Issue[];
}

export interface ChatLinkedResources {
  projects: ChatLinkedProjectResources[];
}

export interface GroupedChats {
  general: NavigationItem[];
  direct: NavigationItem[];
  group: NavigationItem[];
}

// Re-export NavigationItem for backward compatibility
export type { NavigationItem as ChatNavigationItem } from "@/components/SideNav/types";

export interface ChatRole {
  "@id": string;
  "@type": "ChatRole";
  id: number;
  value: string;
}

export interface ChatMember {
  "@id": string;
  "@type": "ChatMember";
  "@context"?: "/contexts/ChatMember";
  id: number;
  chat: string;
  member: UserWithOnlyEmailAndName;
  role: Omit<ChatRole, "id">;
  joinedAt: string;
}

export interface Message {
  "@id": string;
  "@type": "Message";
  "@context"?: "/contexts/Message";
  id: number;
  content: string;
  chat: string;
  sender: string | ChatMember;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
  parent?: string | { "@id": string };
}

export interface Report {
  "@id": string;
  "@type": "Report";
  "@context"?: "/contexts/Report";
  id: number;
  name: string;
  type: string;
  format: string;
  createdAt: string;
  project: string;
  fileUrl: string;
}

export interface UserOAuthProviders {
  "@context": "/contexts/UserOAuthProviders";
  "@id": "/users/me/oauth";
  "@type": "UserOAuthProviders";
  providers: string[];
  lastSyncedAt?: string;
}
