"use server";

import { getAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import { getCurrentUser } from "@/services/userService";
import type { Collection } from "@/types/api/collection";

import type { ActionResult } from "./types/ActionResult";

type EntityType = "organization" | "project" | "chat";

interface MemberResponse {
  role: {
    "@id": string;
    "@type": string;
    value: string;
  };
}

/**
 * Get user's role for a specific entity
 *
 * @param entityType Type of entity (organization, project, chat)
 * @param entityId ID of the entity
 * @returns User's role value or null if not a member
 */
export default async function getEntityRole(
  entityType: EntityType,
  entityId: string,
): Promise<ActionResult<string | null>> {
  try {
    const userResult = await getCurrentUser();
    if (!userResult.ok) {
      return {
        ok: false,
        status: 401,
        code: "UNAUTHORIZED",
        message: "Failed to get current user",
      };
    }

    const user = userResult.value;
    const token = await getAccessToken(process.env.NEXT_PUBLIC_API_URL || "");

    if (!token) {
      return {
        ok: false,
        status: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      };
    }

    // Construct the appropriate endpoint based on entity type
    const endpoint = getEndpoint(entityType, entityId, user.id);

    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/ld+json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        code: "SERVER_ERROR",
        message: `Failed to fetch ${entityType} membership`,
      };
    }

    const data: Collection<MemberResponse> = await response.json();

    // If user is not a member, return null
    if (!data.member || data.member.length === 0) {
      return {
        ok: true,
        content: null,
      };
    }

    // Extract role value from the first member record
    const roleValue = data.member[0]?.role?.value || null;

    return {
      ok: true,
      content: roleValue,
    };
  } catch (error) {
    return handleApiError(error, "Get entity role");
  }
}

/**
 * Get the appropriate API endpoint for the entity type
 */
function getEndpoint(
  entityType: EntityType,
  entityId: string,
  userId: number,
): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  switch (entityType) {
    case "organization":
      return `${baseUrl}/organization_members?organizationId=${entityId}&member.id=${userId}`;
    case "project":
      return `${baseUrl}/project_members?projectId=${entityId}&member.id=${userId}`;
    case "chat":
      return `${baseUrl}/chat_members?chatId=${entityId}&member.id=${userId}`;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}
