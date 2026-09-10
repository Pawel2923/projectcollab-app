"use client";

import { useCallback, useEffect, useState } from "react";

import getEntityRole from "@/actions/permissions/getEntityRole";
import {
  handleSessionExpired,
  refreshSession,
} from "@/services/auth/client-token-refresh";
import { fetchApiLog } from "@/services/log/fetch-api-log";
import type { EntityType } from "@/types/permissions/entity";
import type { Role } from "@/types/permissions/roles";

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
  const [loading, setLoading] = useState(Boolean(entityId));
  const [error, setError] = useState<string | null>(null);
  const [prevEntityId, setPrevEntityId] = useState(entityId);

  if (prevEntityId !== entityId) {
    setPrevEntityId(entityId);
    setLoading(Boolean(entityId));
    setRole(null);
    setError(null);
  }

  const fetchRole = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result = await getEntityRole(entityType, entityId);

      // Silent refresh retry logic
      if (
        !result.ok &&
        (result.code === "UNAUTHORIZED" || result.status === 401)
      ) {
        fetchApiLog({
          level: "debug",
          message: "401 detected while fetching entity role",
          serviceName: "useEntityRole",
          context: {
            entityType,
            entityId,
          },
        });
        const refreshed = await refreshSession();
        if (refreshed) {
          fetchApiLog({
            level: "debug",
            message: "Refresh successful, retrying entity role fetch",
            serviceName: "useEntityRole",
            context: {
              entityType,
              entityId,
            },
          });
          result = await getEntityRole(entityType, entityId);
        } else {
          fetchApiLog({
            level: "error",
            message: "Refresh failed while fetching entity role",
            serviceName: "useEntityRole",
            context: {
              entityType,
              entityId,
            },
          });
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
  }, [entityId, entityType]);

  useEffect(() => {
    if (!entityId) {
      return;
    }

    let isMounted = true;
    const fetchInitialRole = async () => {
      try {
        let result = await getEntityRole(entityType, entityId);

        if (
          !result.ok &&
          (result.code === "UNAUTHORIZED" || result.status === 401)
        ) {
          const refreshed = await refreshSession();
          if (refreshed) {
            result = await getEntityRole(entityType, entityId);
          } else {
            handleSessionExpired();
            return;
          }
        }

        if (!isMounted) return;

        if (result.ok && "content" in result) {
          setRole(result.content as Role | null);
        } else if (!result.ok) {
          setError(result.message || "Failed to fetch role");
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialRole();

    return () => {
      isMounted = false;
    };
  }, [entityType, entityId]);

  return {
    role,
    loading,
    error,
    refetch: fetchRole,
  };
}
