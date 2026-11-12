import { Sun, Moon, Monitor, Check } from "lucide-react"
import { useTheme, type Theme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "cn"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const CurrentIcon =
    theme === "auto" || theme === "system"
      ? Monitor
      : resolvedTheme === "dark"
        ? Moon
        : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative", className)}
            aria-label="Wybierz motyw"
          >
            <CurrentIcon className="size-4.5 transition-all" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="justify-between gap-2"
        >
          <span className="flex items-center gap-2">
            <Sun className="size-4" />
            <span>Jasny</span>
          </span>
          {theme === "light" && <Check className="size-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="justify-between gap-2"
        >
          <span className="flex items-center gap-2">
            <Moon className="size-4" />
            <span>Ciemny</span>
          </span>
          {theme === "dark" && <Check className="size-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("auto")}
          className="justify-between gap-2"
        >
          <span className="flex items-center gap-2">
            <Monitor className="size-4" />
            <span>Automatyczny</span>
          </span>
          {(theme === "auto" || theme === "system") && (
            <Check className="size-3.5 text-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemeSegmentedToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Jasny", icon: Sun },
    { value: "dark", label: "Ciemny", icon: Moon },
    { value: "auto", label: "Auto", icon: Monitor },
  ]

  return (
    <div
      className={cn(
        "flex w-full items-center rounded-lg border border-border bg-muted p-1",
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive =
          theme === opt.value || (opt.value === "auto" && theme === "system")
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
