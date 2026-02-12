"use server";

import type { ActionResult } from "@/actions/types/ActionResult";
import { apiCall } from "@/lib/utils/apiClient";
import { handleApiError } from "@/lib/utils/errorHandler";
import type { Message } from "@/types/api/chat";

export async function sendMessage(
  chatId: string,
  content: string,
  parent?: string,
): Promise<ActionResult<Message>> {
  try {
    const response = await apiCall<Message>("/messages", {
      method: "POST",
      body: {
        content,
        chat: chatId,
        ...(parent && { parent }),
      },
      headers: {
        "Content-Type": "application/ld+json",
        Accept: "application/ld+json",
      },
    });

    if (response.error) {
      return handleApiError(response.error, "Send message");
    }

    if (!response.data) {
      return {
        ok: false,
        code: "UNKNOWN_ERROR",
        status: 500,
        message: "No data returned from server",
      };
    }

    return { ok: true, content: response.data };
  } catch (error) {
    return handleApiError(error, "Send message");
  }
}

export async function deleteMessage(
  messageId: number,
): Promise<ActionResult<Message>> {
  try {
    const response = await apiCall<Message>(`/messages/${messageId}`, {
      method: "PATCH",
      body: {
        isDeleted: true,
      },
      headers: {
        "Content-Type": "application/merge-patch+json",
        Accept: "application/ld+json",
      },
    });

    if (response.error) {
      return handleApiError(response.error, "Delete message");
    }

    if (!response.data) {
      return {
        ok: false,
        code: "UNKNOWN_ERROR",
        status: 500,
        message: "No data returned from server",
      };
    }

    return { ok: true, content: response.data };
  } catch (error) {
    return handleApiError(error, "Delete message");
  }
}
