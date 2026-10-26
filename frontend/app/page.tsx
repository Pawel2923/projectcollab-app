import Image from "next/image";
import Link from "next/link";
import React from "react";

import chatImage from "@/assets/img/chat.webp";
import organizationOverviewImage from "@/assets/img/organization.webp";
import projectOverviewImage from "@/assets/img/project_overview.webp";
import syncImage from "@/assets/img/sync.webp";
import { FeatureSection } from "@/components/landing/FeatureSection";
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
      <div className="relative overflow-hidden bg-hero-gradient pb-8 md:pb-26">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:gap-8 md:px-8 md:py-10 xl:px-12">
          <div className="space-y-6 md:space-y-8 max-w-138">
            <h1 className="text-2xl md:text-3xl">
              Planuj, twórz i współpracuj
            </h1>
            <p className="text-muted-foreground leading-relaxed md:leading-tight">
              Zapewnij swojemu zespołowi narzędzia do zarządzania projektami i
              komunikacji w jednej aplikacji
            </p>
            <Button className="text-base md:text-2xl" asChild>
              {user ? (
                <Link href="/organizations">Przejdź do aplikacji</Link>
              ) : (
                <Link href="/signup">Rozpocznij</Link>
              )}
            </Button>
          </div>
          <div>
            <Image
              src={projectOverviewImage}
              alt="Podsumowanie projektu"
              className="w-full max-w-162"
              sizes="(max-width: 767px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent"></div>
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-col px-4 md:px-8 xl:px-12">
        <div className="w-full space-y-20 pb-8 pt-20 md:space-y-40 md:pb-26 md:pt-40">
          <div className="flex flex-col gap-10 md:gap-16">
            <FeatureSection
              name="Organizuj swoją pracę z użyciem intuicyjnego interfejsu"
              description="Organizacje i projekty pozwalają na zarządzanie członkami zespołów i uporządkowanie pracy"
              imageSrc={organizationOverviewImage}
              imageAlt="Przegląd organizacji"
            />
            <FeatureSection
              name="Rozmawiaj dzięki czatowi"
              description="Komunikuj się ze swoim zespołem dzięki zintegrowanej komunikacji zespołowej i zachowaj kontekst realizowanych prac"
              imageSrc={chatImage}
              imageAlt="Przykładowy czat"
              order="IMAGE_FIRST"
            />
            <FeatureSection
              name="Synchronizuj ze swoimi kalendarzami"
              description="Śledź terminy zadań w twoim kalendarzu. Zaloguj się z kontem Google lub Microsoft i synchronizuj zadania"
              imageSrc={syncImage}
              imageAlt="Kalendarz projektu"
            />
          </div>
        </div>
      </main>
      <footer className="flex flex-col py-3 gap-4 items-center justify-center text-muted-foreground bg-background border-t border-border relative w-full">
        <div className="flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 md:px-8 xl:px-12">
          <p className="text-sm">ProjectCollab &copy; {currentYear}</p>
          <div className="flex gap-2.5 text-xs underline underline-offset-4 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            <Link href="/policy/privacy">Polityka prywatności</Link>
            <Link href="/policy/terms">Warunki korzystania z usługi</Link>
          </div>
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
