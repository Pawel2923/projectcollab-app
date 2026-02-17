import React from "react";

import { classNamesMerger } from "@/utils/class-names-merger";

export function TypographyDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={classNamesMerger("text-sm text-muted-foreground", className)}
    >
      {children}
    </span>
  );
}
