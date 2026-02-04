import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Wysłano link resetujący",
};

import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordSentPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <BackButton
        href="/reset-password"
        label="Wróć do strony resetowania hasła"
      />
      <Card className="flex w-full max-w-lg flex-col gap-6">
        <CardHeader>
          <CardTitle>Sprawdź swoją skrzynkę email</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Jeśli istnieje konto z tym adresem email, wysłaliśmy na nie link do
            resetowania hasła. Sprawdź swoją skrzynkę odbiorczą i postępuj
            zgodnie z instrukcjami, aby zresetować hasło.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
