import * as React from "react"
import { Loader2 } from "lucide-react"

import { m } from "@/paraglide/messages"
import { logoutUseCase } from "../../application/use-cases/logout.use-case"
import { useUserContext } from "../context/UserContext"

export interface LogoutViewProps {
  onLogout?: () => Promise<void> | void
}

export function LogoutView({ onLogout }: LogoutViewProps = {}) {
  const userContext = useUserContext()
  const hasTriggeredRef = React.useRef(false)

  React.useEffect(() => {
    if (hasTriggeredRef.current) {
      return
    }
    hasTriggeredRef.current = true

    const executeLogout =
      onLogout ?? userContext?.logout ?? (() => logoutUseCase.execute())
    void executeLogout()
  }, [onLogout, userContext?.logout])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-muted p-6">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>{m.auth_logging_out()}</span>
      </div>
    </div>
  )
}
