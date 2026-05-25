import { notFound, redirect } from "next/navigation";
import React from "react";

import { ChatWindow } from "@/components/Chat/ChatWindow";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { getCurrentUser } from "@/services/auth/user-service";
import { apiGet } from "@/services/fetch/api-service";
import { logToServer } from "@/services/log/server-logger";
import type { Chat, Message } from "@/types/api/chat";
import type { Collection } from "@/types/api/collection";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string; chatId: string }>;
}) {
  const { chatId, id: organizationId } = await params;

  try {
    const userResult = await getCurrentUser();

    if (!userResult.ok) {
      return <div>Zaloguj się.</div>;
    }

    const user = userResult.value;

    const chatResponse = await apiGet<Chat>(`/chats/${chatId}`);
    const chat = chatResponse.data;

    if (!chat) {
      notFound();
    }

    const currentUserChatMember = chat.chatMembers?.find(
      (cm) => cm.member.id === user.id,
    );

    if (!currentUserChatMember) {
      redirect(`/organizations/${organizationId}/chats`);
    }

    const currentUserRole = currentUserChatMember.role?.value;

    await logToServer({
      level: "debug",
      message: "CurrentUserChatMember",
      serviceName: "page.organizations.chat",
      context: { currentUserChatMember },
    });
    await logToServer({
      level: "debug",
      message: "CurrentUserRole",
      serviceName: "page.organizations.chat",
      context: { currentUserRole },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const [messagesResponse, totalCountResponse] = await Promise.all([
      apiGet<Collection<Message>>(
        `/messages?chat=${chat.id}&order[createdAt]=desc&createdAt[after]=${todayIso}&pagination=false`,
      ),
      apiGet<Collection<Message>>(
        `/messages?chat=${chat.id}&itemsPerPage=1&pagination=true`,
      ),
    ]);

    const messages = messagesResponse.data?.member || [];
    const totalMessagesCount = totalCountResponse.data?.totalItems || 0;

    return (
      <ErrorBoundary>
        <ChatWindow
          chatIri={chat["@id"]}
          chatId={chat.id.toString()}
          initialMessages={messages}
          currentUserId={user.id.toString()}
          initialDate={todayIso}
          totalChatMessages={totalMessagesCount}
          organizationId={organizationId}
          chatMembers={chat.chatMembers || []}
        />
      </ErrorBoundary>
    );
  } catch (e) {
    if (
      (typeof e === "object" &&
        e !== null &&
        "digest" in e &&
        typeof (e as { digest: unknown }).digest === "string" &&
        (e as { digest: string }).digest.includes("NEXT_REDIRECT")) ||
      (e instanceof Error && e.message === "NEXT_REDIRECT")
    ) {
      throw e;
    }

    await logToServer({
      level: "error",
      message: "Failed to load chat",
      serviceName: "page.organizations.chat",
      context: { error: String(e) },
      errorStack: (e as Error)?.stack,
    });
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Nie udało się załadować czatów.
      </div>
    );
  }
}
