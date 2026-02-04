import React from "react";

import type { IconProps } from "./icons";

export function FilterIcon({
  size = 16,
  color = "currentColor",
  className = "",
  ...rest
}: IconProps) {
  return (
    <svg
      width={size}
      height={(size / 16) * 10}
      viewBox="0 0 16 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <path
        d="M13 6H3C2.44772 6 2 5.55228 2 5C2 4.44772 2.44772 4 3 4H13C13.5523 4 14 4.44772 14 5C14 5.55228 13.5523 6 13 6Z"
        fill={color}
      />
      <path
        d="M11 10H5C4.44772 10 4 9.55228 4 9C4 8.44772 4.44772 8 5 8H11C11.5523 8 12 8.44772 12 9C12 9.55228 11.5523 10 11 10Z"
        fill={color}
      />
      <path
        d="M15 2H1C0.447715 2 0 1.55228 0 1C0 0.447715 0.447715 0 1 0H15C15.5523 0 16 0.447715 16 1C16 1.55228 15.5523 2 15 2Z"
        fill={color}
      />
    </svg>
  );
}
