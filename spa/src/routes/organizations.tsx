import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/organizations")({
  component: OrganizationsPage,
})

function OrganizationsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <h1 className="text-2xl font-bold">Organizacje</h1>
    </div>
  )
}
