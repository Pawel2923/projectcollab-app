import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/policy/privacy")({
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <h1 className="text-2xl font-bold">Polityka prywatności</h1>
    </div>
  )
}
