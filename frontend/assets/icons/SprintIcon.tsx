import React from "react";

import type { IconProps } from "./icons";

export function SprintIcon({
  size = 32,
  color = "currentColor",
  ...rest
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-iteration-ccw-icon lucide-iteration-ccw"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="m26.56 19.26 4 4-4 4"
        style={{ display: "inline" }}
        stroke={color}
      />
      <path
        d="m10.346 4.634-.757 5.607 5.606.756"
        style={{ display: "inline", fill: "none" }}
        stroke={color}
      />
      <path
        d="M23.35 10.223c1.74 2.664 1.871 5.889.765 8.56-1.327 3.205-4.477 5.711-8.545 5.711H1.515a1.25 1.25 0 1 1 0-2.5H15.57c3.06 0 5.257-1.802 6.236-4.166.742-1.79.763-3.85-.213-5.683l.649-.088a1.342 1.342 0 0 0 1.15-1.51z"
        style={{
          baselineShift: "baseline",
          display: "inline",
          overflow: "visible",
          opacity: 1,
          vectorEffect: "none",
          fill: color,
          stroke: "none",
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          stopColor: color,
          stopOpacity: 1,
        }}
        stroke="none"
      />
      <path
        style={{
          baselineShift: "baseline",
          display: "inline",
          overflow: "visible",
          opacity: 1,
          vectorEffect: "none",
          fill: color,
          stroke: "none",
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          stopColor: color,
          stopOpacity: 1,
        }}
        d="M15.611 6.003c-1.598-.011.495 2.168 2.553 3.02 2.363.979 4.166 3.176 4.166 6.236.4 1.642.857.678 2.02.35.144-.002.282.018.41.062.044-.129.07-.267.07-.412 0-4.067-2.506-7.218-5.711-8.545a9.355 9.355 0 0 0-3.508-.71Zm0 0a9.084 9.084 0 0 0-4.7 1.258l-.314 2.332 1.08.145c2.018-1.468 4.43-1.567 6.487-.715 1.296.537 2.424 1.44 3.177 2.652l.834-.113a.834.834 0 0 0 .721-.947v-.002l-.043-.325.438-.162a9.335 9.335 0 0 0-7.68-4.123Zm-7.81 4.235c-1.741 2.664-1.873 5.889-.766 8.56a9.373 9.373 0 0 0 1.707 2.695h4.17c-1.678-.698-2.904-2.045-3.569-3.65-.741-1.791-.762-3.85.213-5.684l-.648-.087a1.342 1.342 0 0 1-1.15-1.51Zm15.744 1.527c-.286.41-.707.716-1.237.787l-.101.014c.482 1.182.663 2.422.53 3.617.061.055.126.104.196.146a2.26 2.26 0 0 1 .11-.109c.368-.377.829-.586 1.248-.61a8.88 8.88 0 0 0-.746-3.845zm-.95 10.244a9.627 9.627 0 0 1-3.955 2.5h10.782a1.25 1.25 0 1 0 0-2.5z"
        stroke="none"
      />
      <path
        d="m10.346 4.634-.757 5.607 5.606.756"
        style={{
          display: "inline",
          fill: "none",
          stroke: color,
          strokeWidth: 3,
          strokeDasharray: "none",
        }}
      />
    </svg>
  );
}
