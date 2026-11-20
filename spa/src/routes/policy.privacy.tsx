import { createFileRoute } from "@tanstack/react-router"
import { PrivacyPolicyView } from "@/features/policy"

interface PolicySearchParams {
  referer?: string
}

export const Route = createFileRoute("/policy/privacy")({
  validateSearch: (search: Record<string, unknown>): PolicySearchParams => {
    return {
      referer: typeof search.referer === "string" ? search.referer : undefined,
    }
  },
  component: PrivacyPolicyRouteComponent,
})

function PrivacyPolicyRouteComponent() {
  const { referer } = Route.useSearch()
  return <PrivacyPolicyView referer={referer} />
}
