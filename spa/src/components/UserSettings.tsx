import { ChevronDownIcon } from "@/assets/icons/ChevronDownIcon"
import { useTheme } from "@/components/theme-provider"
import { useUserContext } from "@/store/UserContext"
import { generateUserInitials } from "@/utils/user-initials-generator"
import { Avatar } from "./Avatar"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Sun, Moon, Monitor, Check } from "lucide-react"

interface UserSettingsProps {
  children: React.ReactNode
  trigger?: React.ReactElement
  triggerMessage?: string
}

export function UserSettings({
  children,
  trigger,
  triggerMessage,
}: UserSettingsProps) {
  const userCtx = useUserContext()
  const { theme, resolvedTheme, setTheme } = useTheme()

  const defaultTrigger = (
    <Button
      variant="transparent"
      size="dynamic"
      className="data-[state=open]:[&_svg]:rotate-180"
    >
      {triggerMessage}
      <Avatar
        initials={generateUserInitials(userCtx?.user || null)}
        size="large"
        ariaLabel={`Profil użytkownika ${userCtx?.user?.email ?? ""}`}
      />
      <ChevronDownIcon
        className="transition-transform duration-300"
        aria-hidden="true"
      />
    </Button>
  )

  const CurrentThemeIcon =
    theme === "auto" || theme === "system"
      ? Monitor
      : resolvedTheme === "dark"
        ? Moon
        : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger ?? defaultTrigger} />
      <DropdownMenuContent align="end" className="w-max max-w-[300px]">
        {children}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Ustawienia motywu
        </DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <CurrentThemeIcon className="size-4" />
            <span>Motyw</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-36">
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
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
