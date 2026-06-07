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
      <div className="px-2 pb-10 md:pb-26 md:px-24 space-y-10 md:space-y-26 min-h-(--landing-page-height)">
        <div className="py-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-8 max-w-138">
            <h1 className="text-3xl">Planuj, twórz i współpracuj</h1>
            <p className="text-muted-foreground leading-tight">
              Zapewnij swojemu zespołowi narzędzia do zarządzania projektami i
              komunikacji w jednej aplikacji
            </p>
            <Button className="text-2xl" asChild>
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
            />
          </div>
        </div>
        <div className="max-w-138 md:max-w-full mx-auto">
          <h2 className="text-3xl mb-8">Funkcjonalności</h2>
          <div className="flex flex-col gap-10 md:gap-26">
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
      </div>
      <footer className="flex flex-col py-3 gap-4 items-center justify-center text-muted-foreground bg-white border-t border-border relative w-full">
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
