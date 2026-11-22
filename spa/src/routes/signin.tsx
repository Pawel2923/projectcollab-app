import { createFileRoute } from "@tanstack/react-router"
import { SignInView } from "@/features/authentication"

interface SignInSearchParams {
  redirectUrl?: string
  redirect?: string
  error?: string
}

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>): SignInSearchParams => ({
    redirectUrl:
      typeof search.redirectUrl === "string" ? search.redirectUrl : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: SignInRouteComponent,
})

function SignInRouteComponent() {
  const search = Route.useSearch()
  const redirectUrl = search.redirectUrl ?? search.redirect
  return <SignInView redirectUrl={redirectUrl} error={search.error} />
}
