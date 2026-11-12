import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <h1 className="text-2xl font-bold">Rejestracja</h1>
    </div>
  )
}
