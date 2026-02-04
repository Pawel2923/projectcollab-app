import React from "react";

import type { IconProps } from "./icons";

export function SearchIcon({
  size = 21,
  color = "currentColor",
  className = "",
  ...rest
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      {...rest}
    >
      <path
        d="M18.445 18L14.82 14.375M16.7783 9.66667C16.7783 13.3486 13.7936 16.3333 10.1117 16.3333C6.42978 16.3333 3.44501 13.3486 3.44501 9.66667C3.44501 5.98477 6.42978 3 10.1117 3C13.7936 3 16.7783 5.98477 16.7783 9.66667Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
