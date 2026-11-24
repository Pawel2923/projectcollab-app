import { createFileRoute } from "@tanstack/react-router"
import {
  VerifyEmailConfirmView,
  normalizeVerifyEmailSearchParams,
  type VerifyEmailSearchParams,
} from "@/features/authentication"

export const Route = createFileRoute("/verify-email/verify")({
  validateSearch: (search: Record<string, unknown>): VerifyEmailSearchParams =>
    normalizeVerifyEmailSearchParams(search),
  component: VerifyEmailConfirmRouteComponent,
})

function VerifyEmailConfirmRouteComponent() {
  const search = Route.useSearch()
  return <VerifyEmailConfirmView params={search} />
}
