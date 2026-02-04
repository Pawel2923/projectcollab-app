"use client";

import { AlertTriangle } from "lucide-react";
import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Authentication error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">
            Błąd uwierzytelniania
          </h2>
          <p className="text-sm text-muted-foreground">
            Wystąpił problem podczas przetwarzania żądania. Spróbuj ponownie lub
            skontaktuj się z pomocą techniczną.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 rounded-lg bg-muted p-4 text-left">
              <p className="text-xs font-mono text-destructive">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={() => reset()} variant="default" className="w-full">
            Spróbuj ponownie
          </Button>
          <Button
            onClick={() => (window.location.href = "/signin")}
            variant="outline"
            className="w-full"
          >
            Powrót do logowania
          </Button>
        </div>
      </div>
    </div>
  );
}
