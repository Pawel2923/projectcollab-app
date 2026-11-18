import { Menu } from "lucide-react"

import type { User } from "@/types/api/user"
import { Button } from "@/components/ui/button"
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
import { ThemeSegmentedToggle } from "@/components/ThemeToggle"
import { logout, getUserGreeting } from "@/utils/auth"
import { LoggedOutContent } from "./LoggedOutContent"

export interface LandingMobileMenuProps {
  user: User | null
  onLogout?: () => void
}

export function LandingMobileMenu({
  user,
  onLogout = logout,
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
            aria-label="Otwórz menu nawigacji"
          >
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent className="flex flex-col data-[side=right]:w-full sm:data-[side=right]:w-3/4 sm:data-[side=right]:max-w-sm">
        <SheetHeader>
          <SheetTitle>
            {greeting ? <>{greeting}</> : <>Rozpocznij</>}
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
              onClick={onLogout}
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
            <ThemeSegmentedToggle className="w-full" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose
            render={
              <Button variant="outline" className="w-full">
                Zamknij
              </Button>
            }
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
