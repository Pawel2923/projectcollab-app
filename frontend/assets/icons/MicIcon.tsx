import React from "react";

import type { IconProps } from "./icons";

export function MicIcon({
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
      <g clipPath="url(#clip0_80_415)">
        <path
          d="M16.7784 8.83333V10.5C16.7784 12.0471 16.1638 13.5308 15.0698 14.6248C13.9759 15.7188 12.4921 16.3333 10.945 16.3333M10.945 16.3333C9.39793 16.3333 7.9142 15.7188 6.82024 14.6248C5.72628 13.5308 5.11169 12.0471 5.11169 10.5V8.83333M10.945 16.3333V19.6667M7.61169 19.6667H14.2784M10.945 1.33333C10.282 1.33333 9.6461 1.59673 9.17726 2.06557C8.70842 2.53441 8.44503 3.17029 8.44503 3.83333V10.5C8.44503 11.163 8.70842 11.7989 9.17726 12.2678C9.6461 12.7366 10.282 13 10.945 13C11.6081 13 12.244 12.7366 12.7128 12.2678C13.1816 11.7989 13.445 11.163 13.445 10.5V3.83333C13.445 3.17029 13.1816 2.53441 12.7128 2.06557C12.244 1.59673 11.6081 1.33333 10.945 1.33333Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_80_415">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(0.945007 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
