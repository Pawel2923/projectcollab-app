import { notFound, redirect } from "next/navigation";
import React from "react";

import { ChatWindow } from "@/components/Chat/ChatWindow";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { getCurrentUser } from "@/services/auth/user-service";
import { apiGet } from "@/services/fetch/api-service";
import { logToServer } from "@/services/log/server-logger";
import type { Chat, Message } from "@/types/api/chat";
import type { Collection } from "@/types/api/collection";
import { isRedirectError } from "@/utils/redirect-error";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string; chatId: string }>;
}) {
  const { chatId, id: organizationId } = await params;

  let user: { id: number } | null = null;
  let notLoggedIn = false;
  let hasError = false;
  let chat: Chat | null = null;
  let messages: Message[] = [];
  let totalMessagesCount = 0;
  let todayIso = "";

  try {
    const userResult = await getCurrentUser();

    if (!userResult.ok) {
      notLoggedIn = true;
    } else {
      const currentUser = userResult.value;
      user = currentUser;

      const chatResponse = await apiGet<Chat>(`/chats/${chatId}`);
      const fetchedChat = chatResponse.data;

      if (!fetchedChat) {
        notFound();
      }

      chat = fetchedChat;

      const currentUserChatMember = chat.chatMembers?.find(
        (cm) => cm.member.id === currentUser.id,
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
      todayIso = today.toISOString();

      const [messagesResponse, totalCountResponse] = await Promise.all([
        apiGet<Collection<Message>>(
          `/messages?chat=${chat.id}&order[createdAt]=desc&createdAt[after]=${todayIso}&pagination=false`,
        ),
        apiGet<Collection<Message>>(
          `/messages?chat=${chat.id}&itemsPerPage=1&pagination=true`,
        ),
      ]);

      messages = messagesResponse.data?.member || [];
      totalMessagesCount = totalCountResponse.data?.totalItems || 0;
    }
  } catch (e) {
    if (isRedirectError(e)) {
      throw e;
    }

    await logToServer({
      level: "error",
      message: "Failed to load chat",
      serviceName: "page.organizations.chat",
      context: { error: String(e) },
      errorStack: (e as Error)?.stack,
    });
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Nie udało się załadować czatów.
      </div>
    );
  }

  if (notLoggedIn || !user || !chat) {
    return <div>Zaloguj się.</div>;
  }

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
}
