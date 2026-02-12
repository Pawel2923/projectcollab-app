import type { Issue } from "../api/issue";
import type { Project, ProjectMember } from "../api/project";
import type { Sprint } from "../api/sprint";

export interface ChatLinkedProjectResources {
  project: Project;
  members: ProjectMember[];
  sprints: Sprint[];
  issues: Issue[];
}

export interface ChatLinkedResources {
  projects: ChatLinkedProjectResources[];
}
