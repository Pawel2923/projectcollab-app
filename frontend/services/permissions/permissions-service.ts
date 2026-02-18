import { ROLE_HIERARCHY } from "@/constants/role-hierarchy";
import {
  CHAT_ROLE_PERMISSIONS,
  ORGANIZATION_ROLE_PERMISSIONS,
  PROJECT_ROLE_PERMISSIONS,
} from "@/constants/role-permissions";
import type {
  ChatRole,
  OrganizationRole,
  ProjectRole,
  Role,
} from "@/types/permissions/roles";

export function getPermissionDescription(
  role: ProjectRole | OrganizationRole | ChatRole,
  entityType: "project" | "organization" | "chat",
): { base: string[]; inherited?: string[] } {
  if (entityType === "project") {
    return PROJECT_ROLE_PERMISSIONS[role as ProjectRole] || { base: [] };
  } else if (entityType === "organization") {
    return (
      ORGANIZATION_ROLE_PERMISSIONS[role as OrganizationRole] || { base: [] }
    );
  } else {
    return CHAT_ROLE_PERMISSIONS[role as ChatRole] || { base: [] };
  }
}

/**
 * Check if user's role has the required permission level
 * @param userRole The role the user has
 * @param requiredRole The role required for the action
 * @returns True if user's role satisfies the requirement
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  if (userRole === requiredRole) {
    return true;
  }

  const inheritedRoles = ROLE_HIERARCHY[userRole];
  if (inheritedRoles) {
    return inheritedRoles.includes(requiredRole);
  }

  return false;
}
