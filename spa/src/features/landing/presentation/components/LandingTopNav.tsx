import { Link } from "@tanstack/react-router"

import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype"
import type { User } from "@/features/authentication"
import {
  logout,
  getUserGreeting,
  useUserContext,
  UserSettings,
} from "@/features/authentication"
import { DropdownMenuItem, ThemeToggle } from "@/shared/ui"
import { LanguageSwitcher } from "@/shared/i18n"
import { m } from "@/paraglide/messages"
import { LandingMobileMenu } from "./LandingMobileMenu"
import { LoggedOutContent } from "./LoggedOutContent"

export interface LandingTopNavProps {
  user: User | null
  onLogout?: () => Promise<void> | void
}

export function LandingTopNav({ user, onLogout }: LandingTopNavProps) {
  const userContext = useUserContext()
  const greeting = getUserGreeting(user)
  const handleLogout = onLogout ?? userContext?.logout ?? logout
  const isLoggingOut = userContext?.isLoggingOut ?? false

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
          <ThemeToggle className="hidden sm:inline-flex" tooltip />
          <LanguageSwitcher className="hidden sm:inline-flex" tooltip />
          <LandingMobileMenu
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <UserSettings
                triggerMessage={greeting ? `${greeting}!` : undefined}
              >
                <DropdownMenuItem
                  disabled={isLoggingOut}
                  onClick={() => void handleLogout()}
                >
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
