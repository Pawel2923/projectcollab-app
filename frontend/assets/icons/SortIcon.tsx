import React from "react";

import type { IconProps } from "./icons";

export function SortIcon({
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
        d="M15 0H1C0.447715 0 0 0.447715 0 1C0 1.55228 0.447715 2 1 2H15C15.5523 2 16 1.55228 16 1C16 0.447715 15.5523 0 15 0Z"
        fill={color}
      />
      <path
        d="M11 4H1C0.447715 4 0 4.44772 0 5C0 5.55228 0.447715 6 1 6H11C11.5523 6 12 5.55228 12 5C12 4.44772 11.5523 4 11 4Z"
        fill={color}
      />
      <path
        d="M7 8H1C0.447715 8 0 8.44772 0 9C0 9.55228 0.447715 10 1 10H7C7.55228 10 8 9.55228 8 9C8 8.44772 7.55228 8 7 8Z"
        fill={color}
      />
    </svg>
  );
}
