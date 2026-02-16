"use client";

import React, { type ReactNode } from "react";

import type { EntityType, Role } from "@/constants/roleHierarchy";
import { useEntityRole } from "@/hooks/useEntityRole";
import { hasPermission } from "@/lib/utils/permissions";

interface ProtectedActionProps {
  entityType: EntityType;
  entityId: string;
  requiredRole: Role;
  children: ReactNode;
  fallback?: ReactNode;
  showUnauthorized?: boolean;
}

/**
 * Component wrapper that conditionally renders children based on user's role permissions
 *
 * @example
 * ```tsx
 * <ProtectedAction
 *   entityType="project"
 *   entityId="123"
 *   requiredRole="EDITOR"
 * >
 *   <Button>Edit Issue</Button>
 * </ProtectedAction>
 * ```
 */
export function ProtectedAction({
  entityType,
  entityId,
  requiredRole,
  children,
  fallback = null,
  showUnauthorized = false,
}: ProtectedActionProps) {
  const { role, loading } = useEntityRole(entityType, entityId);

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // User has no role (not a member) or doesn't have required permission
  if (!role || !hasPermission(role, requiredRole)) {
    if (showUnauthorized && fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  // User has required permission
  return <>{children}</>;
}
