import type { Metadata } from "next";
import React from "react";

import { ResendVerifyEmailButton } from "@/components/Authentication/ResendVerifyEmailButton";
import { BackButton } from "@/components/BackButton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Zweryfikuj email",
};

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <BackButton href="/signup" label="Wróć do strony rejestracji" />
      <Card className="flex w-full max-w-lg flex-col gap-6">
        <CardHeader>
          <CardTitle>Zweryfikuj email</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sprawdź swoją skrzynkę email, aby zweryfikować swoje konto.</p>
          <p>
            Nie ma wiadomości w skrzynce odbiorczej? Sprawdź folder spam lub
            spróbuj ponownie.
          </p>
        </CardContent>
        <CardFooter>
          <ResendVerifyEmailButton />
        </CardFooter>
      </Card>
    </div>
  );
}
