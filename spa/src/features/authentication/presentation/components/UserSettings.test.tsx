import * as React from "react"
import { describe, it, expect } from "vitest"
import { renderToString } from "react-dom/server"
import { DropdownMenu, DropdownMenuContent } from "@/shared/ui"
import { UserContext, type UserContextType } from "../context/UserContext"
import { UserSettings } from "./UserSettings"
import type { User } from "../../domain/models/user"

describe("UserSettings", () => {
  const dummyUser: User = {
    id: 123,
    email: "john.doe@example.com",
    roles: ["ROLE_USER"],
    username: "John Doe",
  }

  const dummyContextValue: UserContextType = {
    user: dummyUser,
    setUser: () => {},
    isLoading: false,
    isLoggingOut: false,
    logout: async () => {},
  }

  it("renders default trigger with greeting message, medium avatar initials, and layout gap", () => {
    const html = renderToString(
      <UserContext.Provider value={dummyContextValue}>
        <UserSettings triggerMessage="Hello John">
          <div>Log out</div>
        </UserSettings>
      </UserContext.Provider>
    )

    expect(html).toContain("Hello John")
    expect(html).toContain(">J<")
    expect(html).toContain("h-8 w-8 text-sm")
    expect(html).toContain("gap-2.5")
  })

  it("applies proper chevron animation classes to the trigger and chevron icon", () => {
    const html = renderToString(
      <UserContext.Provider value={dummyContextValue}>
        <UserSettings triggerMessage="Hello John">
          <div>Log out</div>
        </UserSettings>
      </UserContext.Provider>
    )

    expect(html).toContain("data-popup-open:[&amp;_svg]:rotate-180")
    expect(html).toContain("aria-expanded:[&amp;_svg]:rotate-180")
    expect(html).toContain("transition-transform duration-300")
  })

  it("renders custom trigger when provided", () => {
    const html = renderToString(
      <UserSettings
        trigger={
          <button type="button" id="custom-trigger">
            Custom
          </button>
        }
      >
        <div>Log out</div>
      </UserSettings>
    )

    expect(html).toContain('id="custom-trigger"')
    expect(html).toContain("Custom")
  })

  it("renders menu content with children and without theme toggler", () => {
    function TestComponent() {
      const element = UserSettings({
        children: <div id="logout-item">Log out</div>,
      })
      const children = React.Children.toArray(
        element.props.children
      ) as React.ReactElement<{ children?: React.ReactNode }>[]
      const content = children.find(
        (child) => child.type === DropdownMenuContent
      )

      return <DropdownMenu>{content?.props.children}</DropdownMenu>
    }

    const html = renderToString(<TestComponent />)

    expect(html).toContain("logout-item")
    expect(html).not.toContain("dropdown-menu-sub")
    expect(html).not.toContain('data-slot="dropdown-menu-label"')
  })
})
