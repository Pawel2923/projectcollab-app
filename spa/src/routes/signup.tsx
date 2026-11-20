import { createFileRoute } from "@tanstack/react-router"
import { SignUpView } from "@/features/authentication"

export const Route = createFileRoute("/signup")({
  component: SignUpView,
})
