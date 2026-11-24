import * as React from "react"
import {
  createRootRouteWithContext,
  Outlet,
  useNavigate,
} from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "@/shared/theme"
import { UserProvider } from "@/features/authentication"
import { I18nProvider } from "@/shared/i18n"
import { TooltipProvider } from "@/shared/ui"

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const navigate = useNavigate()

  const handleLogoutRedirect = React.useCallback(async () => {
    await navigate({ to: "/signin", replace: true })
  }, [navigate])

  return (
    <ThemeProvider defaultTheme="auto" storageKey="theme">
      <UserProvider onLogoutRedirect={handleLogoutRedirect}>
        <I18nProvider>
          <TooltipProvider>
            <Outlet />
          </TooltipProvider>
        </I18nProvider>
      </UserProvider>
      {import.meta.env.DEV && (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        </>
      )}
    </ThemeProvider>
  )
}
