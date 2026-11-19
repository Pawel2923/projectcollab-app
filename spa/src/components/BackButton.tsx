import { ChevronLeftIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "cn"

interface BackButtonProps {
  href: string
  label: string
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
  const isExternal = href.startsWith("http://") || href.startsWith("https://")

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "border shadow-sm top-4 left-4 bg-background dark:bg-background",
              position,
              className
            )}
            aria-label={ariaLabel ?? label}
            render={
              isExternal ? (
                <a href={href} />
              ) : (
                <Link to={href as string} />
              )
            }
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
