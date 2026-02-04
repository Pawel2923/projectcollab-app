"use client";

import { AlertTriangle } from "lucide-react";
import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function SprintsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Sprints route error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">
            Błąd ładowania sprintów
          </h2>
          <p className="text-sm text-muted-foreground">
            Nie udało się załadować listy sprintów. Spróbuj ponownie.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 rounded-lg bg-muted p-4 text-left">
              <p className="text-xs font-mono text-destructive">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <Button onClick={() => reset()} variant="default" className="w-full">
          Spróbuj ponownie
        </Button>
      </div>
    </div>
  );
}
