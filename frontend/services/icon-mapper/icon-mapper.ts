import type React from "react";

import { iconMap } from "@/services/icon-mapper/icon-map";

export function mapIcon(iconKey: string): React.ReactNode | undefined {
  return iconMap?.[iconKey];
}
