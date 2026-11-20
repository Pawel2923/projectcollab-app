import { ChevronLeftIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/shared/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"
import { cn } from "@/shared/lib/utils"
import { m } from "@/paraglide/messages"

export interface BackButtonProps {
  href: string
  label?: string
  ariaLabel?: string
  position?: "fixed" | "absolute"
  className?: string
}

export function BackButton({
  href,
  label,
  ariaLabel,
  position = "absolute",
  className,
}: BackButtonProps) {
  const displayLabel = label ?? m.common_back()
  const isExternal = href.startsWith("http://") || href.startsWith("https://")

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "top-4 left-4 border bg-background shadow-sm dark:bg-background",
              position,
              className
            )}
            aria-label={ariaLabel ?? displayLabel}
            render={
              isExternal ? <a href={href} /> : <Link to={href as string} />
            }
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
        }
      />
      <TooltipContent>{displayLabel}</TooltipContent>
    </Tooltip>
  )
}
