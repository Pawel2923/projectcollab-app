import { Link } from "@tanstack/react-router"
import { Button } from "@/shared/ui"
import { cn } from "@/shared/lib/utils"
import { m } from "@/paraglide/messages"

export interface LoggedOutContentProps {
  className?: string
}

export function LoggedOutContent({ className }: LoggedOutContentProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Button variant="secondary" render={<Link to="/signin" />}>
        {m.landing_nav_sign_in()}
      </Button>
      <Button render={<Link to="/signup" />}>{m.landing_nav_sign_up()}</Button>
    </div>
  )
}
