import { createFileRoute, Outlet } from "@tanstack/react-router"
import { requireAuth } from "@/features/authentication"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    return requireAuth({
      queryClient: context.queryClient,
      location,
    })
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <Outlet />
}
