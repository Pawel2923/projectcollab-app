import type { UserWithOnlyEmailAndName } from "./user";

export interface Chat {
  "@id": string;
  "@type": "Chat";
  "@context"?: "/contexts/Chat";
  id: number;
  name: string;
  type: string;
  organization: string;
  project?: string;
  issue?: string;
  sprint?: string;
  chatMembers?: ChatMember[];
  createdAt?: string;
  lastMessageAt?: string;
}

export interface ChatRole {
  "@id": string;
  "@type": "ChatRole";
  id: number;
  value: string;
}

export interface ChatMember {
  "@id": string;
  "@type": "ChatMember";
  "@context"?: "/contexts/ChatMember";
  id: number;
  chat: string;
  member: UserWithOnlyEmailAndName;
  role: Omit<ChatRole, "id">;
  joinedAt: string;
}

export interface Message {
  "@id": string;
  "@type": "Message";
  "@context"?: "/contexts/Message";
  id: number;
  content: string;
  chat: string;
  sender: string | ChatMember;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
  parent?: string | { "@id": string };
}
