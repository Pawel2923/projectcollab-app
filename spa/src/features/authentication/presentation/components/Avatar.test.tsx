import { describe, it, expect } from "vitest"
import { renderToString } from "react-dom/server"
import { Avatar } from "./Avatar"

describe("Avatar", () => {
  it("renders small avatar with corresponding size classes", () => {
    const html = renderToString(<Avatar initials="AB" size="small" />)
    expect(html).toContain("h-6 w-6 text-xs")
    expect(html).toContain("AB")
  })

  it("renders medium avatar with corresponding size classes", () => {
    const html = renderToString(<Avatar initials="CD" size="medium" />)
    expect(html).toContain("h-8 w-8 text-sm")
    expect(html).toContain("CD")
  })

  it("renders large avatar with corresponding size classes", () => {
    const html = renderToString(<Avatar initials="EF" size="large" />)
    expect(html).toContain("h-10 w-10 text-sm")
    expect(html).toContain("EF")
  })

  it("renders circular avatar by default", () => {
    const html = renderToString(<Avatar initials="GH" size="medium" />)
    expect(html).toContain("rounded-full")
  })

  it("renders non-circular avatar when isCircle is false", () => {
    const html = renderToString(
      <Avatar initials="IJ" size="medium" isCircle={false} />
    )
    expect(html).toContain("rounded-lg")
  })

  it("renders custom aria label", () => {
    const html = renderToString(
      <Avatar initials="KL" size="medium" ariaLabel="User avatar for KL" />
    )
    expect(html).toContain('aria-label="User avatar for KL"')
  })
})
