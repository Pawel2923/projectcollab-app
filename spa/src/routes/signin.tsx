import { createFileRoute } from "@tanstack/react-router"
import { SignInView } from "@/features/authentication"

export const Route = createFileRoute("/signin")({
  component: SignInView,
})
