import React from "react";

import type { IconProps } from "./icons";

export function SubtaskIcon({
  size = 24,
  color = "currentColor",
  className = "",
  strokeWidth,
  ...rest
}: IconProps) {
  const scaleFactor = size / 24;
  const baseStrokeWidth = strokeWidth || 2;
  const thinStrokeWidth = 1.336 * scaleFactor;
  const extraThinStrokeWidth = 0.7 * scaleFactor;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      {...rest}
    >
      <g
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={baseStrokeWidth}
      >
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 9h4" />
        <path
          stroke={color}
          strokeWidth={thinStrokeWidth}
          d="M12.135 13.123h3.57"
        />
        <path d="M8 9h.01" />
        <path strokeWidth={thinStrokeWidth} d="M12.139 15.642h3.57" />
        <path
          stroke={color}
          strokeWidth={extraThinStrokeWidth}
          d="M8.07 13.124h3.6m-.02 2.522-3.655.004L8 9.914"
        />
      </g>
    </svg>
  );
}
