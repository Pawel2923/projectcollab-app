import React from "react";

type InfoRowProps = {
  label: string;
  value?: string | null;
};

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground/70">
        {label}
      </span>
      <span className="text-sm text-foreground" suppressHydrationWarning>
        {value || "Brak danych"}
      </span>
    </div>
  );
}
