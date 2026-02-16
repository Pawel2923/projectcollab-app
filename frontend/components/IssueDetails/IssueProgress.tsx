import React from "react";

import { formatEstimatedTime } from "@/services/issue/issue-date-time-service";

import { TypographyDescription } from "../typography/TypographyDescription";
import { Progress } from "../ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface IssueProgressProps {
  issue: {
    loggedTime?: number | null;
    estimated?: number | null;
  };
}

export function IssueProgress({ issue }: IssueProgressProps) {
  const progress = getCurrentProgress(issue.loggedTime, issue.estimated);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          Zarejestrowany czas pracy
          <Progress value={progress} />
          <TypographyDescription>
            {formatEstimatedTime(issue.loggedTime || 0)} /{" "}
            {formatEstimatedTime(issue.estimated || 0)}
          </TypographyDescription>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        Zarejestrowano {progress || 0}% szacowanego czasu pracy.
      </TooltipContent>
    </Tooltip>
  );
}

function getCurrentProgress(
  loggedTime?: number | null,
  estimated?: number | null,
) {
  if (!loggedTime || !estimated) {
    return;
  }

  const progress = (loggedTime / estimated) * 100;

  return Math.max(0, Math.min(100, Math.round(progress)));
}
