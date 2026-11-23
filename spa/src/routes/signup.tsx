import { createFileRoute } from "@tanstack/react-router"
import { requireGuest, SignUpView } from "@/features/authentication"

export const Route = createFileRoute("/signup")({
  beforeLoad: async ({ context }) => {
    await requireGuest({ queryClient: context.queryClient })
  },
  component: SignUpView,
})
