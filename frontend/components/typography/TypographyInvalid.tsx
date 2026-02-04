import React from "react";

export function TypographyInvalid({ children }: { children: React.ReactNode }) {
  return <span className="text-destructive text-sm">{children}</span>;
}
