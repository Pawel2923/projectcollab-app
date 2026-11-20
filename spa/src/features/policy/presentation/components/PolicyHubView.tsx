import { Link } from "@tanstack/react-router"
import { ChevronRightIcon, FileTextIcon, ShieldCheckIcon } from "lucide-react"
import { BackButton } from "@/shared/ui"

export function PolicyHubView() {
  return (
    <>
      <BackButton href="/" label="Powróć" position="fixed" />

      <main className="mx-auto max-w-3xl px-4 py-12 text-foreground">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Zasady i polityki</h1>
          <p className="text-base text-muted-foreground">
            Zapoznaj się z regulaminem korzystania z serwisu oraz zasadami
            ochrony prywatności i przetwarzania danych w aplikacji
            ProjectCollab.
          </p>
        </header>

        <nav
          aria-label="Nawigacja po dokumentach prawnych"
          className="grid gap-6 sm:grid-cols-2"
        >
          <Link
            to="/policy/terms"
            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <FileTextIcon className="size-5" aria-hidden="true" />
                </div>
                <ChevronRightIcon
                  className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-card-foreground group-hover:text-primary">
                Warunki korzystania
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Zasady i regulamin korzystania z platformy ProjectCollab, prawa
                i obowiązki użytkowników oraz warunki techniczne.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-medium text-primary">
              Przejdź do warunków
              <ChevronRightIcon className="ml-1 size-4" aria-hidden="true" />
            </div>
          </Link>

          <Link
            to="/policy/privacy"
            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <ShieldCheckIcon className="size-5" aria-hidden="true" />
                </div>
                <ChevronRightIcon
                  className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-card-foreground group-hover:text-primary">
                Polityka prywatności
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Informacje o przetwarzaniu i ochronie danych osobowych, celach
                ich gromadzenia oraz przysługujących Ci prawach.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-medium text-primary">
              Przejdź do polityki prywatności
              <ChevronRightIcon className="ml-1 size-4" aria-hidden="true" />
            </div>
          </Link>
        </nav>
      </main>
    </>
  )
}
