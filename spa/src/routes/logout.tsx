import { createFileRoute } from "@tanstack/react-router"
import { LogoutView } from "@/features/authentication"

export const Route = createFileRoute("/logout")({
  component: LogoutView,
})
