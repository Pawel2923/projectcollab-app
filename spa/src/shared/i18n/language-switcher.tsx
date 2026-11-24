import { Languages, Check } from "lucide-react"
import { useLocale } from "./i18n-provider"
import { getLocaleLabel } from "./i18n"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"
import { cn } from "@/shared/lib/utils"
import { m } from "@/paraglide/messages"

export interface LanguageSwitcherProps {
  className?: string
  showLabel?: boolean
  tooltip?: string | boolean
  tooltipSide?: "top" | "bottom" | "left" | "right"
}

export function LanguageSwitcher({
  className,
  showLabel = false,
  tooltip,
  tooltipSide = "bottom",
}: LanguageSwitcherProps) {
  const { locale, setLocale, locales } = useLocale()

  const tooltipText =
    typeof tooltip === "string" ? tooltip : m.language_switcher_label()

  const trigger = (
    <DropdownMenuTrigger
      render={
        <Button
          variant="ghost"
          size={showLabel ? "default" : "icon"}
          className={cn("relative gap-1.5", className)}
          aria-label={m.language_switcher_label()}
        >
          <Languages className="size-4.5 transition-all" />
          {showLabel && (
            <span className="text-xs font-medium uppercase">{locale}</span>
          )}
        </Button>
      }
    />
  )

  return (
    <DropdownMenu>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger render={trigger} />
          <TooltipContent side={tooltipSide}>{tooltipText}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <DropdownMenuContent align="end" className="w-auto min-w-36">
        {locales.map((itemLocale) => (
          <DropdownMenuItem
            key={itemLocale}
            onClick={() => void setLocale(itemLocale)}
            className="cursor-pointer justify-between gap-2"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 text-xs font-semibold text-muted-foreground uppercase">
                {itemLocale}
              </span>
              <span>{getLocaleLabel(itemLocale)}</span>
            </span>
            {locale === itemLocale && (
              <Check className="size-3.5 shrink-0 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LanguageSegmentedToggle({ className }: { className?: string }) {
  const { locale, setLocale, locales } = useLocale()

  return (
    <div
      className={cn(
        "flex w-full items-center rounded-lg border border-border bg-muted p-1",
        className
      )}
    >
      {locales.map((itemLocale) => {
        const isActive = locale === itemLocale
        return (
          <Button
            key={itemLocale}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void setLocale(itemLocale)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-xs hover:bg-background"
                : "text-muted-foreground hover:bg-transparent hover:text-foreground"
            )}
          >
            <span className="font-semibold uppercase">{itemLocale}</span>
            <span>({getLocaleLabel(itemLocale)})</span>
          </Button>
        )
      })}
    </div>
  )
}
