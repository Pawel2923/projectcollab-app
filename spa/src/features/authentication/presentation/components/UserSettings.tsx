import * as React from "react"
import { ChevronDownIcon } from "@/assets/icons/ChevronDownIcon"
import { generateUserInitials } from "../../domain/services/user-display"
import { useUserContext } from "../context/UserContext"
import { Avatar } from "./Avatar"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui"
import { m } from "@/paraglide/messages"

export interface UserSettingsProps {
  children: React.ReactNode
  trigger?: React.ReactElement
  triggerMessage?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UserSettings({
  children,
  trigger,
  triggerMessage,
  open,
  defaultOpen,
  onOpenChange,
}: UserSettingsProps) {
  const userCtx = useUserContext()

  const defaultTrigger = (
    <Button
      variant="transparent"
      size="dynamic"
      className="flex items-center gap-2.5 aria-expanded:[&_svg]:rotate-180 data-popup-open:[&_svg]:rotate-180 data-[state=open]:[&_svg]:rotate-180"
    >
      {triggerMessage && <span>{triggerMessage}</span>}
      <Avatar
        initials={generateUserInitials(userCtx?.user || null)}
        size="medium"
        ariaLabel={m.user_settings_avatar_aria_label({
          email: userCtx?.user?.email ?? "",
        })}
      />
      <ChevronDownIcon
        className="transition-transform duration-300 ease-in-out group-aria-expanded/button:rotate-180 group-data-popup-open/button:rotate-180"
        aria-hidden="true"
      />
    </Button>
  )

  return (
    <DropdownMenu
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuTrigger render={trigger ?? defaultTrigger} />
      <DropdownMenuContent align="end" className="w-max max-w-75">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
