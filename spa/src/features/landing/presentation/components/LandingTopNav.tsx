import { Link } from "@tanstack/react-router"

import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype"
import type { User } from "@/features/authentication"
import {
  logout,
  getUserGreeting,
  UserSettings,
} from "@/features/authentication"
import { DropdownMenuItem, ThemeToggle } from "@/shared/ui"
import { LanguageSwitcher } from "@/shared/i18n"
import { m } from "@/paraglide/messages"
import { LandingMobileMenu } from "./LandingMobileMenu"
import { LoggedOutContent } from "./LoggedOutContent"

export interface LandingTopNavProps {
  user: User | null
}

export function LandingTopNav({ user }: LandingTopNavProps) {
  const greeting = getUserGreeting(user)

  return (
    <nav className="sticky top-0 z-20 flex h-16 w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-2 md:h-21 md:gap-4 md:px-8 lg:px-24">
      <div className="flex w-full items-center justify-between">
        <Link
          to="/"
          aria-label={m.landing_nav_logotype_aria_label()}
          className="pt-2 md:pt-1"
        >
          <ProjectCollabLogotype />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <LandingMobileMenu user={user} onLogout={logout} />
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <UserSettings
                triggerMessage={greeting ? `${greeting}!` : undefined}
              >
                <DropdownMenuItem onClick={logout}>
                  {m.landing_nav_log_out()}
                </DropdownMenuItem>
              </UserSettings>
            ) : (
              <LoggedOutContent className="md:flex-row" />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
