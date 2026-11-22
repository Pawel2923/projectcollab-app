import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"
import { m } from "@/paraglide/messages"

export interface PasswordToggleProps extends Omit<
  React.ComponentProps<"input">,
  "type"
> {
  inputClassName?: string
}

export const PasswordToggle = React.forwardRef<
  HTMLInputElement,
  PasswordToggleProps
>(function PasswordToggle({ className, inputClassName, ...props }, ref) {
  const [isVisible, setIsVisible] = React.useState(false)

  const toggleVisibility = React.useCallback(() => {
    setIsVisible((prev) => !prev)
  }, [])

  return (
    <div className={cn("relative flex items-center", className)}>
      <Input
        ref={ref}
        type={isVisible ? "text" : "password"}
        className={cn("pr-10", inputClassName)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleVisibility}
        className="absolute top-0 right-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
        aria-label={isVisible ? m.auth_hide_password() : m.auth_show_password()}
        tabIndex={-1}
      >
        {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  )
})
