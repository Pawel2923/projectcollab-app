import { Menu } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype"
import type { User } from "@/types/api/user"

import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { UserSettings } from "@/components/UserSettings"
import { ThemeToggle, ThemeSegmentedToggle } from "@/components/ThemeToggle"

export function LandingTopNav({ user }: { user: User | null }) {
  return (
    <nav className="sticky top-0 z-20 flex h-16 w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-2 md:h-21 md:gap-4 md:px-8 lg:px-24">
      <div className="flex w-full items-center justify-between">
        <Link to="/" aria-label="ProjectCollab">
          <ProjectCollabLogotype />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Otwórz menu nawigacji"
                >
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>
                  {user ? (
                    <>Cześć {user.username || user.email}</>
                  ) : (
                    <>Rozpocznij</>
                  )}
                </SheetTitle>
                <SheetDescription>
                  {user ? (
                    <>Sprawdź ustawienia i wyloguj się</>
                  ) : (
                    <>Zaloguj się lub zarejestruj się</>
                  )}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 p-4">
                {user ? (
                  <Button
                    variant="secondary"
                    onClick={logoutBtnClickHandler}
                    className="w-full"
                  >
                    Wyloguj się
                  </Button>
                ) : (
                  <LoggedOutContent />
                )}
                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Motyw
                  </p>
                  <ThemeSegmentedToggle />
                </div>
              </div>
              <SheetFooter>
                <SheetClose
                  render={<Button variant="outline">Zamknij</Button>}
                />
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <UserSettings triggerMessage={`Cześć ${user.username}!`}>
                <DropdownMenuItem onClick={logoutBtnClickHandler}>
                  Wyloguj się
                </DropdownMenuItem>
              </UserSettings>
            ) : (
              <LoggedOutContent />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function LoggedOutContent() {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Button variant="secondary" render={<Link to="/signin" />}>
        Zaloguj się
      </Button>
      <Button render={<Link to="/signup" />}>Zarejestruj się</Button>
    </div>
  )
}

async function logoutBtnClickHandler() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    })

    if (!response.ok) {
      return
    }

    const data = await response.json().catch(() => ({}))
    window.location.href = data.redirect || "/signin"
  } catch (error) {
    console.error("Logout failed", error)
  }
}
