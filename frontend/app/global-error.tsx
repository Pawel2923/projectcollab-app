"use client";

import { AlertTriangle } from "lucide-react";
import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Wystąpił krytyczny błąd aplikacji
              </h1>
              <p className="text-muted-foreground">
                Przepraszamy, wystąpił nieoczekiwany błąd. Prosimy odświeżyć
                stronę lub spróbować ponownie później.
              </p>

              {process.env.NODE_ENV === "development" && (
                <div className="mt-4 rounded-lg bg-muted p-4 text-left">
                  <p className="text-sm font-mono text-destructive">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={() => reset()} variant="default">
                Spróbuj ponownie
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
              >
                Wróć do strony głównej
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
