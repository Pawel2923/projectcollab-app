import { createFileRoute } from "@tanstack/react-router"
import { requireGuest, SignUpView } from "@/features/authentication"

interface SignUpSearchParams {
  redirectUrl?: string
  redirect?: string
  error?: string
}

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): SignUpSearchParams => ({
    redirectUrl:
      typeof search.redirectUrl === "string" ? search.redirectUrl : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  beforeLoad: async ({ context }) => {
    await requireGuest({ queryClient: context.queryClient })
  },
  component: SignUpRouteComponent,
})

function SignUpRouteComponent() {
  const search = Route.useSearch()
  const redirectUrl = search.redirectUrl ?? search.redirect
  return <SignUpView redirectUrl={redirectUrl} error={search.error} />
}
