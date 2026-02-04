import React from "react";

import type { IconProps } from "./icons";

export function ChevronDownIcon({
  size = 17,
  color = "currentColor",
  className = "",
  ...rest
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      {...rest}
    >
      <path
        d="M4.89001 6.5L8.89001 10.5L12.89 6.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
