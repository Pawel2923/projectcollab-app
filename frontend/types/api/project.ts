import type { Organization } from "./organization";
import type { UserWithOnlyEmailAndName } from "./user";

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
