export type ProjectRole =
  | "CREATOR"
  | "ADMIN"
  | "PRODUCT_OWNER"
  | "SCRUM_MASTER"
  | "DEVELOPER"
  | "EDITOR"
  | "MEMBER"
  | "VIEWER";
export type OrganizationRole = "CREATOR" | "ADMIN" | "MEMBER";

export type ChatRole = "CREATOR" | "ADMIN" | "MODERATOR" | "MEMBER";

/**
 * All possible roles
 */
export type Role = ProjectRole | OrganizationRole | ChatRole;
