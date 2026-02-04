import { notFound, redirect } from "next/navigation";
import React from "react";

import { ChatWindow } from "@/components/Chat/ChatWindow";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getCurrentUser } from "@/lib/services/userService";
import type { Chat, Collection, Message } from "@/lib/types/api";
import { apiGet } from "@/lib/utils/apiClient";

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

    console.log(
      "[ChatPage:33]: CurrentUserChatMember: ",
      currentUserChatMember,
    );
    console.log("[ChatPage:36]: CurrentUserRole: ", currentUserRole);

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

    const mercureUrl =
      process.env.NEXT_PUBLIC_MERCURE_URL ||
      "http://localhost/.well-known/mercure";

    return (
      <ErrorBoundary>
        <ChatWindow
          chatIri={chat["@id"]}
          chatId={chat.id.toString()}
          initialMessages={messages}
          currentUserId={user.id.toString()}
          mercureUrl={mercureUrl}
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

    console.error("Failed to load chat:", e);
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Nie udało się załadować czatów.
      </div>
    );
  }
}
