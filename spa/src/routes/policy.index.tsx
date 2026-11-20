import { createFileRoute } from "@tanstack/react-router"
import { PolicyHubView } from "@/features/policy"

export const Route = createFileRoute("/policy/")({
  component: PolicyHubView,
})
