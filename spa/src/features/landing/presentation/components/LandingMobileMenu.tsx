import { Loader2, Menu } from "lucide-react"

import type { User } from "@/features/authentication"
import { logout, getUserGreeting } from "@/features/authentication"
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  ThemeSegmentedToggle,
} from "@/shared/ui"
import { LanguageSegmentedToggle } from "@/shared/i18n"
import { m } from "@/paraglide/messages"
import { LoggedOutContent } from "./LoggedOutContent"

export interface LandingMobileMenuProps {
  user: User | null
  onLogout?: () => Promise<void> | void
  isLoggingOut?: boolean
}

export function LandingMobileMenu({
  user,
  onLogout = logout,
  isLoggingOut = false,
}: LandingMobileMenuProps) {
  const greeting = getUserGreeting(user)

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={m.landing_nav_menu_open_aria_label()}
          >
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent className="flex flex-col data-[side=right]:w-full sm:data-[side=right]:w-3/4 sm:data-[side=right]:max-w-sm">
        <SheetHeader>
          <SheetTitle>
            {greeting ? (
              <>{greeting}</>
            ) : (
              <>{m.landing_hero_cta_logged_out()}</>
            )}
          </SheetTitle>
          <SheetDescription>
            {user ? (
              <>{m.landing_nav_menu_desc_user()}</>
            ) : (
              <>{m.landing_nav_menu_desc_guest()}</>
            )}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 p-4">
          {user ? (
            <Button
              variant="secondary"
              onClick={() => void onLogout()}
              disabled={isLoggingOut}
              className="w-full gap-2"
            >
              {m.landing_nav_log_out()}
              {isLoggingOut && <Loader2 className="size-4 animate-spin" />}
            </Button>
          ) : (
            <LoggedOutContent />
          )}
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {m.landing_nav_menu_theme()}
            </p>
            <ThemeSegmentedToggle className="w-full" />
          </div>
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {m.language_switcher_label()}
            </p>
            <LanguageSegmentedToggle className="w-full" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose
            render={
              <Button variant="outline" className="w-full">
                {m.landing_nav_menu_close()}
              </Button>
            }
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
