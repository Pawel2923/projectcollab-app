"use client";

import Link from "next/link";
import React from "react";

import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype";
import { fetchApiLog } from "@/services/log/fetch-api-log";
import type { User } from "@/types/api/user";
import type { LogoutResponse } from "@/types/auth/logout";

import { Button } from "../ui/button";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { UserSettings } from "../UserSettings";

export function LandingTopNav({ user }: { user: User | null }) {
  return (
    <>
      <nav
        className="hidden h-21 w-full flex-wrap items-center justify-between gap-4 border-b border-border bg-white px-4 py-2 dark:bg-black md:flex col-span-2 sticky top-0 z-20"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-6">
          <Link href={"/"}>
            <ProjectCollabLogotype />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <UserSettings triggerMessage={`Cześć ${user.username}!`}>
                <DropdownMenuItem onClick={logoutBtnClickHandler}>
                  Wyloguj się
                </DropdownMenuItem>
              </UserSettings>
            </>
          ) : (
            <>
              <Button asChild variant="secondary">
                <Link href="/signin">Zaloguj się</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Zarejestruj się</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </>
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
