import { createFileRoute } from "@tanstack/react-router"
import { VerifyEmailView } from "@/features/authentication"

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailView,
})
