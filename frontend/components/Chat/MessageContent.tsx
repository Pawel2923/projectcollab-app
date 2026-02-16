import React from "react";

import { parseMentions } from "@/lib/utils/mentionUtils";
import type { MentionData } from "@/services/mentionService";

import { Mention } from "./Mention";

interface MessageContentProps {
  content: string;
  mentionData: MentionData;
}

export function MessageContent({ content, mentionData }: MessageContentProps) {
  const segments = parseMentions(content, mentionData);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.isMention && segment.type) {
          return (
            <Mention
              key={index}
              type={segment.type}
              text={segment.text}
              data={segment.data}
            />
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </>
  );
}
