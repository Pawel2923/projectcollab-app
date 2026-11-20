import { createFileRoute } from "@tanstack/react-router"
import { TermsPolicyView } from "@/features/policy"

interface PolicySearchParams {
  referer?: string
}

export const Route = createFileRoute("/policy/terms")({
  validateSearch: (search: Record<string, unknown>): PolicySearchParams => {
    return {
      referer: typeof search.referer === "string" ? search.referer : undefined,
    }
  },
  component: TermsPolicyRouteComponent,
})

function TermsPolicyRouteComponent() {
  const { referer } = Route.useSearch()
  return <TermsPolicyView referer={referer} />
}
