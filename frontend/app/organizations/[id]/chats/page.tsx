import { redirect } from "next/navigation";
import React from "react";

import { getCurrentUser } from "@/services/auth/user-service";
import { apiGet } from "@/services/fetch/api-service";
import { logToServer } from "@/services/log/server-logger";
import type { Chat } from "@/types/api/chat";
import type { Collection } from "@/types/api/collection";
import { isRedirectError } from "@/utils/redirect-error";

export default async function ChatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: organizationId } = await params;

  let redirectUrl: string | null = null;
  let isEmpty = false;
  let hasError = false;

  try {
    const userResult = await getCurrentUser();

    if (!userResult.ok) {
      redirect("/signin");
    }

    const user = userResult.value;

    const chatsResponse = await apiGet<Collection<Chat>>(
      `/chats?organizationId=${organizationId}&chatMembers.member=${user.id}`,
    );
    const chats = chatsResponse.data?.member || [];

    if (chats.length === 0) {
      isEmpty = true;
    } else {
      // Redirect to general chat if available
      const generalChat = chats.find((c) => c.type === "general");
      if (generalChat) {
        redirectUrl = `/organizations/${organizationId}/chats/${generalChat.id}`;
      } else {
        // Fallback to first chat if no general chat exists
        redirectUrl = `/organizations/${organizationId}/chats/${chats[0].id}`;
      }
    }
  } catch (e) {
    if (isRedirectError(e)) {
      throw e;
    }

    await logToServer({
      level: "error",
      message: "Failed to fetch chats",
      serviceName: "page.organizations.chats",
      context: { error: String(e) },
      errorStack: (e as Error)?.stack,
    });
    hasError = true;
  }

  if (hasError) {
    return (
      <ChatsPageLayout>
        <div className="flex items-center justify-center h-full text-red-500">
          Nie udało się załadować czatów.
        </div>
      </ChatsPageLayout>
    );
  }

  if (isEmpty) {
    return (
      <ChatsPageLayout>
        <div className="flex items-center justify-center h-full text-gray-500">
          Nie znaleziono czatów.
        </div>
      </ChatsPageLayout>
    );
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }
}

function ChatsPageLayout({
  children,
}: {
  children: React.ReactNode;
  organizationId?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2 h-full">
      {children}
    </div>
  );
}
