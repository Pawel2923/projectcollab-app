"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import React from "react";

import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype";
import { fetchApiLog } from "@/services/log/fetch-api-log";
import type { User } from "@/types/api/user";
import type { LogoutResponse } from "@/types/auth/logout";

import { Button } from "../ui/button";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { UserSettings } from "../UserSettings";

export function LandingTopNav({ user }: { user: User | null }) {
  return (
    <>
      <nav
        className="h-21 w-full flex-wrap items-center justify-between gap-4 border-b border-border bg-white px-4 py-2 dark:bg-black flex col-span-2 sticky top-0 z-20"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-6">
          <Link href={"/"}>
            <ProjectCollabLogotype />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger className="md:hidden">
              <Menu />
            </SheetTrigger>
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
              <div className="flex-1">
                {user ? (
                  <Button
                    variant={"secondary"}
                    onClick={logoutBtnClickHandler}
                    className="w-full"
                  >
                    Wyloguj się
                  </Button>
                ) : (
                  <LoggedOutContent />
                )}
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Zamknij</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <div className="hidden md:flex gap-4">
            {user ? (
              <>
                <UserSettings triggerMessage={`Cześć ${user.username}!`}>
                  <DropdownMenuItem onClick={logoutBtnClickHandler}>
                    Wyloguj się
                  </DropdownMenuItem>
                </UserSettings>
              </>
            ) : (
              <LoggedOutContent />
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

function LoggedOutContent() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Button asChild variant="secondary">
        <Link href="/signin">Zaloguj się</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Zarejestruj się</Link>
      </Button>
    </div>
  );
}

async function logoutBtnClickHandler() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      fetchApiLog({
        level: "error",
        message: "Logout failed with non-ok response",
        statusCode: response.status,
        serviceName: "TopNav.logoutBtnClickHandler",
        context: { response },
      });

      return;
    }

    const redirectResponse = ((await response.json()) as LogoutResponse)
      .redirect;
    window.location.href = redirectResponse || "/signin";
  } catch (error) {
    fetchApiLog({
      level: "error",
      message: "Logout failed",
      context: { error },
      serviceName: "TopNav.logoutBtnClickHandler",
    });
  }
}
