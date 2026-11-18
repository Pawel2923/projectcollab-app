import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface LoggedOutContentProps {
  className?: string
}

export function LoggedOutContent({ className }: LoggedOutContentProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Button variant="secondary" render={<Link to="/signin" />}>
        Zaloguj się
      </Button>
      <Button render={<Link to="/signup" />}>Zarejestruj się</Button>
    </div>
  )
}
