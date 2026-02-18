/**
 * Role inheritance mapping matching backend implementation
 */
export const ROLE_HIERARCHY: Record<string, string[]> = {
  CREATOR: [
    "PRODUCT_OWNER",
    "ADMIN",
    "SCRUM_MASTER",
    "DEVELOPER",
    "EDITOR",
    "MEMBER",
    "VIEWER",
  ],
  PRODUCT_OWNER: [
    "CREATOR",
    "ADMIN",
    "SCRUM_MASTER",
    "DEVELOPER",
    "EDITOR",
    "MEMBER",
    "VIEWER",
  ],
  ADMIN: ["SCRUM_MASTER", "DEVELOPER", "EDITOR", "MEMBER", "VIEWER"],
  SCRUM_MASTER: ["DEVELOPER", "EDITOR", "MEMBER", "VIEWER"],
  DEVELOPER: ["EDITOR", "MEMBER", "VIEWER"],
  EDITOR: ["MEMBER", "VIEWER"],
  MEMBER: ["VIEWER"],
  VIEWER: [],
  // Chat-specific roles
  MODERATOR: ["MEMBER"],
} as const;
