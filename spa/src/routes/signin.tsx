import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/signin")({
  component: SignInPage,
})

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <h1 className="text-2xl font-bold">Logowanie</h1>
    </div>
  )
}
