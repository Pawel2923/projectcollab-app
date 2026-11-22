import type { SVGAttributes } from "react"

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  size?: number
  color?: string
  className?: string
}

export { ChevronDownIcon } from "./ChevronDownIcon"
export { GoogleLogoIcon } from "./GoogleLogoIcon"
export { MicrosoftLogoIcon } from "./MicrosoftLogoIcon"
