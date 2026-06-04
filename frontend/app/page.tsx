import Image from "next/image";
import Link from "next/link";
import React from "react";

import chatImage from "@/assets/img/chat.webp";
import projectOverviewImage from "@/assets/img/project_overview.webp";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/services/auth/user-service";
import { logToServer } from "@/services/log/server-logger";
import { UserProvider } from "@/store/UserContext";
import type { User } from "@/types/api/user";
import { match } from "@/utils/result";

const currentYear = new Date().getFullYear();

export default async function Home() {
  const user = await tryToGetCurrentUser();

  return (
    <UserProvider initial={user}>
      <LandingTopNav user={user} />
      <div className="px-2 md:px-24 space-y-10 md:space-y-26 mb-10 md:mb-26">
        <div className="pt-8 flex flex-col gap-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-xl">Planuj, twórz i współpracuj</h1>
              <p className="text-muted-foreground leading-tight">
                Zapewnij swojemu zespołowi narzędzia do zarządzania projektami i
                komunikacji w jednej aplikacji
              </p>
            </div>
            <Button className="text-xl" asChild>
              {user ? (
                <Link href="/organizations">Przejdź do aplikacji</Link>
              ) : (
                <Link href="/signup">Rozpocznij</Link>
              )}
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-24">
          <div className="flex flex-col gap-2.5 py-2 justify-center items-center">
            <p>Organizuj swoją pracę z użyciem intuicyjnego interfejsu</p>
            <Image
              src={projectOverviewImage}
              alt="Podsumowanie projektu"
              className="w-full max-w-162"
            />
          </div>
          <div className="flex flex-col gap-2.5 py-2 justify-center items-center">
            <p>Komunikuj się z członkami zespołu w jednej aplikacji</p>
            <Image
              src={chatImage}
              alt="Czat tekstowy"
              className="w-full max-w-162"
            />
          </div>
        </div>
      </div>
      <footer className="flex flex-col py-3 gap-4 items-center justify-center text-muted-foreground bg-white border-t border-border relative bottom-0 md:absolute w-full">
        <p className="text-sm">ProjectCollab &copy; {currentYear}</p>
        <div className="flex gap-2.5 text-xs underline underline-offset-4">
          <Link href="/policy/privacy" className="">
            Polityka prywatności
          </Link>
          <Link href="/policy/terms">Warunki korzystania z usługi</Link>
        </div>
      </footer>
    </UserProvider>
  );
}

async function tryToGetCurrentUser(): Promise<User | null> {
  try {
    const result = await getCurrentUser();
    return match(result, {
      ok: (user) => user,
      err: (error) => {
        logToServer({
          level: "warn",
          message: "Failed to get current user on landing page",
          context: { error, result },
          serviceName: "HomePage.getCurrentUser",
        });

        return null;
      },
    });
  } catch (error) {
    await logToServer({
      level: "warn",
      message: "Error occured while fetching current user on landing page",
      context:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error },
      serviceName: "HomePage.getCurrentUser",
    });

    return null;
  }
}
