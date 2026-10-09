"use client";

import React from "react";

interface DateSeparatorProps {
  date: Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex justify-center my-4">
      <span
        className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"
        suppressHydrationWarning
      >
        {date.toLocaleDateString("pl-PL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </span>
    </div>
  );
}
