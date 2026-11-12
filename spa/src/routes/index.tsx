import { createFileRoute, Link } from "@tanstack/react-router"

import chatImage from "@/assets/img/chat.webp"
import organizationOverviewImage from "@/assets/img/organization.webp"
import projectOverviewImage from "@/assets/img/project_overview.webp"
import syncImage from "@/assets/img/sync.webp"
import { FeatureSection } from "@/components/landing/FeatureSection"
import { LandingTopNav } from "@/components/landing/LandingTopNav"
import { Button } from "@/components/ui/button"
import { useUserContext } from "@/store/UserContext"

const currentYear = new Date().getFullYear()

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  const userContext = useUserContext()
  const user = userContext?.user ?? null

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingTopNav user={user} />
      <div className="relative overflow-hidden bg-hero-gradient pb-8 md:pb-26">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:gap-8 md:px-8 md:py-10 xl:px-12">
          <div className="max-w-138 space-y-6 md:space-y-8">
            <h1 className="text-2xl font-semibold md:text-3xl">
              Planuj, twórz i współpracuj
            </h1>
            <p className="leading-relaxed text-muted-foreground md:leading-tight">
              Zapewnij swojemu zespołowi narzędzia do zarządzania projektami i
              komunikacji w jednej aplikacji
            </p>
            <Button
              className="text-base md:text-2xl"
              size="lg"
              render={
                user ? <Link to="/organizations" /> : <Link to="/signup" />
              }
            >
              {user ? "Przejdź do aplikacji" : "Rozpocznij"}
            </Button>
          </div>
          <div>
            <img
              src={projectOverviewImage}
              alt="Podsumowanie projektu"
              className="w-full max-w-162"
            />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent"></div>
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 md:px-8 xl:px-12">
        <div className="w-full space-y-20 pt-20 pb-8 md:space-y-40 md:pt-40 md:pb-26">
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

      <footer className="relative flex w-full flex-col items-center justify-center gap-4 border-t border-border bg-background py-3 text-muted-foreground">
        <div className="flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 md:px-8 xl:px-12">
          <p className="text-sm">ProjectCollab &copy; {currentYear}</p>
          <div className="flex gap-2.5 text-xs underline underline-offset-4 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            <Link to="/policy/privacy">Polityka prywatności</Link>
            <Link to="/policy/terms">Warunki korzystania z usługi</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
