import type {
  MentionChat,
  MentionData,
  MentionIssue,
} from "@/services/mentionService";
import type { Chat } from "@/types/api/chat";
import type { Project } from "@/types/api/project";
import type { Sprint } from "@/types/api/sprint";
import type { UserWithOnlyEmailAndName } from "@/types/api/user";

export interface ParsedSegment {
  text: string;
  isMention: boolean;
  type?: "user" | "context";
  data?: UserWithOnlyEmailAndName | Project | MentionIssue | Sprint | Chat;
}

const defaultResult: MentionMatchResult = {
  matchFound: false,
  bestMatchIndex: -1,
  bestMatchLength: 0,
  bestMatchType: undefined,
  bestMatchData: undefined,
} as const;

export function parseMentions(
  text: string,
  data: MentionData,
): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let remainingText = text;

  while (remainingText.length > 0) {
    const result = findContextMentions(remainingText, data);

    if (result.matchFound && result.bestMatchIndex !== -1) {
      remainingText = pushMentionSegment(remainingText, result, segments);
    } else {
      segments.push({
        text: remainingText,
        isMention: false,
      });
      remainingText = "";
    }
  }

  return segments;
}

function findContextMentions(
  remainingText: string,
  data: MentionData,
): MentionMatchResult {
  const allContexts = [
    ...data.projects,
    ...data.issues,
    ...data.sprints,
    ...data.chats,
  ];

  const getName = (item: Project | MentionIssue | Sprint | MentionChat) => {
    if ("key" in item) return item.key;
    if ("displayName" in item && item.displayName) return item.displayName;
    if ("name" in item) return item.name;
    return "";
  };

  allContexts.sort((a, b) => getName(b).length - getName(a).length);

  let searchStartIndex = 0;
  while (true) {
    const hashIndex = remainingText.indexOf("#", searchStartIndex);
    if (hashIndex === -1) {
      return defaultResult;
    }

    const textAfterHash = remainingText.substring(hashIndex + 1);

    for (const item of allContexts) {
      const name = getName(item);
      if (!name) continue;

      if (textAfterHash.startsWith(name)) {
        const nextCharIndex = hashIndex + 1 + name.length;
        const nextChar = remainingText[nextCharIndex];
        const isBoundary = !nextChar || /[\s.,!?;:]/.test(nextChar);

        if (isBoundary) {
          return {
            matchFound: true,
            bestMatchIndex: hashIndex,
            bestMatchLength: name.length + 1,
            bestMatchType: "context",
            bestMatchData: item,
          };
        }
      }
    }

    searchStartIndex = hashIndex + 1;
  }
}

function pushMentionSegment(
  remainingText: string,
  result: MentionMatchResult,
  segments: ParsedSegment[],
): string {
  if (result.bestMatchIndex > 0) {
    segments.push({
      text: remainingText.substring(0, result.bestMatchIndex),
      isMention: false,
    });
  }

  segments.push({
    text: remainingText.substring(
      result.bestMatchIndex,
      result.bestMatchIndex + result.bestMatchLength,
    ),
    isMention: true,
    type: result.bestMatchType,
    data: result.bestMatchData,
  });

  return remainingText.substring(
    result.bestMatchIndex + result.bestMatchLength,
  );
}

interface MentionMatchResult {
  matchFound: boolean;
  bestMatchIndex: number;
  bestMatchLength: number;
  bestMatchType?: "user" | "context";
  bestMatchData?:
    | UserWithOnlyEmailAndName
    | Project
    | MentionIssue
    | Sprint
    | Chat;
}
