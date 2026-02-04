import React from "react";

import type { IconProps } from "./icons";

export function BellIcon({
  size = 20,
  color = "currentColor",
  className = "",
  ...rest
}: IconProps) {
  return (
    <svg
      width={size}
      height={(size / 20) * 21}
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      {...rest}
    >
      <path
        d="M11.4415 18C11.295 18.2526 11.0847 18.4622 10.8317 18.6079C10.5787 18.7537 10.2919 18.8304 9.99988 18.8304C9.70789 18.8304 9.42104 18.7537 9.16802 18.6079C8.91501 18.4622 8.70472 18.2526 8.55821 18M14.9999 7.16667C14.9999 5.84058 14.4731 4.56881 13.5354 3.63113C12.5977 2.69345 11.326 2.16667 9.99988 2.16667C8.6738 2.16667 7.40203 2.69345 6.46434 3.63113C5.52666 4.56881 4.99988 5.84058 4.99988 7.16667C4.99988 13 2.49988 14.6667 2.49988 14.6667H17.4999C17.4999 14.6667 14.9999 13 14.9999 7.16667Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
