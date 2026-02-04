import React from "react";

import type { IconProps } from "./icons";

export function ChevronsLeftIcon({
  size = 20,
  color = "currentColor",
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      {...rest}
    >
      <path
        d="M9.16667 14.1666L5 9.99998L9.16667 5.83331M15 14.1666L10.8333 9.99998L15 5.83331"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
