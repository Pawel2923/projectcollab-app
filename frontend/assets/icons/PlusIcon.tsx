import React from "react";

import type { IconProps } from "./icons";

export function PlusIcon({
  size = 17,
  color = "currentColor",
  className = "",
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 17 17"
      fill="none"
      className={`inline-block ${className}`}
      {...rest}
    >
      <path
        d="M8.94499 3.83333V13.1667M4.27832 8.5H13.6117"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
