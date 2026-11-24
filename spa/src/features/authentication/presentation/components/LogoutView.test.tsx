import { describe, it, expect } from "vitest"
import { renderToString } from "react-dom/server"
import { m } from "@/paraglide/messages"
import { LogoutView } from "./LogoutView"

describe("LogoutView", () => {
  it("renders accessible signing-out status indicator", () => {
    const html = renderToString(<LogoutView />)

    expect(html).toContain('role="status"')
    expect(html).toContain(m.auth_logging_out())
  })
})
