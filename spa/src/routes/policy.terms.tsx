import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/policy/terms")({
  component: TermsPolicyPage,
})

function TermsPolicyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <h1 className="text-2xl font-bold">Warunki korzystania z usługi</h1>
    </div>
  )
}
