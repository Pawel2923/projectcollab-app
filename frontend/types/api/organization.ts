import type { UserWithOnlyEmailAndName } from "./user";

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
