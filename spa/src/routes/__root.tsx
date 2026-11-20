import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "@/shared/theme"
import { UserProvider } from "@/features/authentication"
import { I18nProvider } from "@/shared/i18n"

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="auto" storageKey="theme">
      <I18nProvider>
        <UserProvider>
          <Outlet />
        </UserProvider>
      </I18nProvider>
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
