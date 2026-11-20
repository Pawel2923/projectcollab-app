import { m } from "@/paraglide/messages"

export function SignInView() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <h1 className="text-2xl font-bold">{m.auth_sign_in_title()}</h1>
    </div>
  )
}
