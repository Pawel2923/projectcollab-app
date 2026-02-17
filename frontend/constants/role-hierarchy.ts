/**
 * Role hierarchy definition matching backend implementation
 * Each role inherits permissions from roles in its array
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
