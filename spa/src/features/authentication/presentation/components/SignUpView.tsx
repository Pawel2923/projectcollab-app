import { m } from "@/paraglide/messages"

export function SignUpView() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <h1 className="text-2xl font-bold">{m.auth_sign_up_title()}</h1>
    </div>
  )
}
