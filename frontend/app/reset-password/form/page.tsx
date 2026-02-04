import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Zmień hasło",
};

import { ResetPasswordChangeForm } from "@/components/Authentication/ResetPasswordChangeForm";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResetPasswordFormPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <BackButton href="/signin" label="Wróć do strony logowania" />
      <Card className={"w-full max-w-sm"}>
        <CardHeader>
          <CardTitle>Zresetuj hasło</CardTitle>
        </CardHeader>
        <CardContent>
          <ResetPasswordChangeForm />
        </CardContent>
      </Card>
    </div>
  );
}
