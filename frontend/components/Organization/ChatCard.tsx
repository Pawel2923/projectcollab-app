import { MessageSquare } from "lucide-react";
import Link from "next/link";
import React from "react";

import { formatDistanceToNow } from "@/utils/date-utils";

import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface ChatCardProps {
  id: number;
  name: string;
  type: string;
  organizationId: string;
  lastMessageAt?: string;
}

export function ChatCard({
  id,
  name,
  type,
  organizationId,
  lastMessageAt,
}: ChatCardProps) {
  return (
    <Card className="relative bg-background hover:bg-light-hover transition-colors">
      <Link
        aria-label={`Otwórz czat ${name}`}
        className="absolute inset-0 z-10 rounded-xl"
        href={`/organizations/${organizationId}/chats/${id}`}
      />
      <CardHeader className="pointer-events-none relative">
        <CardTitle className="text-base">{name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <MessageSquare className="h-3 w-3" />
          {type === "general" && "Czat ogólny"}
          {type === "direct" && "Wiadomość bezpośrednia"}
          {type === "group" && "Czat grupowy"}
          {lastMessageAt && (
            <>
              <span>•</span>
              <span suppressHydrationWarning>
                {formatDistanceToNow(new Date(lastMessageAt))}
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
