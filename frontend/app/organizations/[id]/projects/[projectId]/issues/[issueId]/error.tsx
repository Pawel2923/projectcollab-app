"use client";

import { RefreshCw } from "lucide-react";
import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function IssueDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Issue details route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">
          Nie udało się załadować szczegółów zadania
        </h2>
        <p className="text-sm text-muted-foreground">
          Wystąpił nieoczekiwany błąd. Spróbuj ponownie za chwilę.
        </p>
      </div>
      <Button
        onClick={reset}
        variant="secondary"
        className="inline-flex items-center gap-2"
      >
        <RefreshCw className="size-4" />
        Odśwież stronę
      </Button>
    </div>
  );
}
