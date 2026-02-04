import { type Role, ROLE_HIERARCHY } from "@/lib/constants/roleHierarchy";

/**
 * Check if user's role has the required permission level
 *
 * @param userRole The role the user has
 * @param requiredRole The role required for the action
 * @returns True if user's role satisfies the requirement
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  // Direct match
  if (userRole === requiredRole) {
    return true;
  }

  // Check if userRole inherits requiredRole
  const inheritedRoles = ROLE_HIERARCHY[userRole];
  if (inheritedRoles) {
    return inheritedRoles.includes(requiredRole);
  }

  return false;
}

/**
 * Get all roles inherited by the given role
 *
 * @param role The role to get inheritance for
 * @returns Array of inherited role names
 */
export function getInheritedRoles(role: Role): string[] {
  return ROLE_HIERARCHY[role] || [];
}

/**
 * Check if a role exists in the hierarchy
 */
export function isValidRole(role: string): role is Role {
  return role in ROLE_HIERARCHY;
}
