"use client";

import { useEffect, useState } from "react";

import getEntityRole from "@/actions/getEntityRole";
import type { EntityType, Role } from "@/constants/roleHierarchy";
import {
  handleSessionExpired,
  refreshSession,
} from "@/lib/utils/clientTokenRefresh";

interface UseEntityRoleResult {
  role: Role | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch and cache user's role for a specific entity
 *
 * @param entityType Type of entity (organization, project, chat)
 * @param entityId ID of the entity
 * @returns User's role, loading state, error, and refetch function
 */
export function useEntityRole(
  entityType: EntityType,
  entityId: string,
): UseEntityRoleResult {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = async () => {
    try {
      setLoading(true);
      setError(null);

      let result = await getEntityRole(entityType, entityId);

      // Silent refresh retry logic
      if (
        !result.ok &&
        (result.code === "UNAUTHORIZED" || result.status === 401)
      ) {
        console.log(
          "[useEntityRole] 401 detected, attempting silent refresh...",
        );
        const refreshed = await refreshSession();
        if (refreshed) {
          console.log("[useEntityRole] Refresh successful, retrying fetch...");
          result = await getEntityRole(entityType, entityId);
        } else {
          console.log("[useEntityRole] Refresh failed, redirecting...");
          handleSessionExpired();
          return;
        }
      }

      if (result.ok && "content" in result) {
        setRole(result.content as Role | null);
      } else if (!result.ok) {
        setError(result.message || "Failed to fetch role");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  return {
    role,
    loading,
    error,
    refetch: fetchRole,
  };
}
