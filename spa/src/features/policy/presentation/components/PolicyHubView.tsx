import { Link } from "@tanstack/react-router"
import { ChevronRightIcon, FileTextIcon, ShieldCheckIcon } from "lucide-react"
import { BackButton } from "@/shared/ui"
import { m } from "@/paraglide/messages"

export function PolicyHubView() {
  return (
    <>
      <BackButton href="/" label={m.common_back()} position="fixed" />

      <main className="mx-auto max-w-3xl px-4 py-12 text-foreground">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{m.policy_hub_title()}</h1>
          <p className="text-base text-muted-foreground">
            {m.policy_hub_description()}
          </p>
        </header>

        <nav
          aria-label={m.policy_hub_nav_aria_label()}
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
                {m.policy_hub_terms_title()}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {m.policy_hub_terms_description()}
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-medium text-primary">
              {m.policy_hub_terms_cta()}
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
                {m.policy_hub_privacy_title()}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {m.policy_hub_privacy_description()}
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-medium text-primary">
              {m.policy_hub_privacy_cta()}
              <ChevronRightIcon className="ml-1 size-4" aria-hidden="true" />
            </div>
          </Link>
        </nav>
      </main>
    </>
  )
}
