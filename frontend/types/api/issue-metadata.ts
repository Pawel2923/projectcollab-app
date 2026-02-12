import type { UserWithOnlyEmailAndName } from "./user";

export interface Tag {
  "@id": string;
  "@type": "tag";
  "@context"?: "/contexts/Tag";
  id: number;
  title: string;
  backgroundColor?: string;
  textColor?: string;
  issueTags?: {
    "@type": "IssueTag";
    "@id": string;
    issue: string;
  };
}

export interface IssueComment {
  "@id": string;
  "@type": "Comment";
  "@context"?: "/contexts/Comment";
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  commenter?: UserWithOnlyEmailAndName;
}

export interface Attachment {
  "@id": string;
  "@type": "Attachment";
  id: number;
  type: string;
  path: string;
  uploadedAt: string;
}
