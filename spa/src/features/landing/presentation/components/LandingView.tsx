import { Link } from "@tanstack/react-router"

import chatImage from "@/assets/img/chat.webp"
import organizationOverviewImage from "@/assets/img/organization.webp"
import projectOverviewImage from "@/assets/img/project_overview.webp"
import syncImage from "@/assets/img/sync.webp"
import { FeatureSection } from "./FeatureSection"
import { LandingTopNav } from "./LandingTopNav"
import { Button } from "@/shared/ui"
import { useUserContext } from "@/features/authentication"
import { m } from "@/paraglide/messages"

const currentYear = new Date().getFullYear()

export function LandingView() {
  const userContext = useUserContext()
  const user = userContext?.user ?? null

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingTopNav user={user} />
      <div className="relative overflow-hidden bg-hero-gradient pb-8 md:pb-26">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:gap-8 md:px-8 md:py-10 xl:px-12">
          <div className="max-w-138 space-y-6 md:space-y-8">
            <h1 className="text-2xl font-semibold md:text-3xl">
              {m.landing_hero_title()}
            </h1>
            <p className="leading-relaxed text-muted-foreground md:leading-tight">
              {m.landing_hero_description()}
            </p>
            <Button
              className="text-base md:px-6 md:py-5 md:text-2xl"
              size="lg"
              render={
                user ? <Link to="/organizations" /> : <Link to="/signup" />
              }
            >
              {user
                ? m.landing_hero_cta_logged_in()
                : m.landing_hero_cta_logged_out()}
            </Button>
          </div>
          <div className="w-full max-w-162">
            <img
              src={projectOverviewImage}
              alt={m.landing_hero_image_alt()}
              width={1350}
              height={853}
              className="aspect-[1350/853] w-full"
            />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent"></div>
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 md:px-8 xl:px-12">
        <div className="w-full space-y-20 pt-20 pb-8 md:space-y-40 md:pt-40 md:pb-26">
          <div className="flex flex-col gap-10 md:gap-16">
            <FeatureSection
              name={m.landing_feature_organization_title()}
              description={m.landing_feature_organization_description()}
              imageSrc={organizationOverviewImage}
              imageAlt={m.landing_feature_organization_image_alt()}
            />
            <FeatureSection
              name={m.landing_feature_chat_title()}
              description={m.landing_feature_chat_description()}
              imageSrc={chatImage}
              imageAlt={m.landing_feature_chat_image_alt()}
              order="IMAGE_FIRST"
            />
            <FeatureSection
              name={m.landing_feature_calendar_title()}
              description={m.landing_feature_calendar_description()}
              imageSrc={syncImage}
              imageAlt={m.landing_feature_calendar_image_alt()}
            />
          </div>
        </div>
      </main>

      <footer className="relative flex w-full flex-col items-center justify-center gap-4 border-t border-border bg-background py-3 text-muted-foreground">
        <div className="flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 md:px-8 xl:px-12">
          <p className="text-sm">
            {m.landing_footer_copyright({ year: currentYear })}
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 text-xs underline underline-offset-4 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            <Link to="/policy/privacy">{m.landing_footer_privacy()}</Link>
            <Link to="/policy/terms">{m.landing_footer_terms()}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
