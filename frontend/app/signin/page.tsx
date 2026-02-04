import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype";
import { SignInForm } from "@/components/Authentication/SignInForm";

export const metadata: Metadata = {
  title: "Zaloguj się do ProjectCollab",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectUrl?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = params.redirectUrl;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <ProjectCollabLogotype />
        </Link>
        <SignInForm redirectUrl={redirectUrl} />
      </div>
    </div>
  );
}
