import { createFileRoute } from "@tanstack/react-router"
import { VerifyEmailView } from "@/features/authentication"

interface VerifyEmailIndexSearchParams {
  email?: string
}

export const Route = createFileRoute("/verify-email/")({
  validateSearch: (
    search: Record<string, unknown>
  ): VerifyEmailIndexSearchParams => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: VerifyEmailRouteComponent,
})

function VerifyEmailRouteComponent() {
  const search = Route.useSearch()
  return <VerifyEmailView email={search.email} />
}
