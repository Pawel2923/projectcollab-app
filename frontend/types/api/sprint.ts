import type { Issue } from "./issue";

export enum SprintStatusEnum {
  CREATED = "created",
  STARTED = "started",
  COMPLETED = "completed",
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
