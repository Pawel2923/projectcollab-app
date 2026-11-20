import { createFileRoute } from "@tanstack/react-router"
import { OrganizationsView } from "@/features/organizations"

export const Route = createFileRoute("/organizations")({
  component: OrganizationsView,
})
