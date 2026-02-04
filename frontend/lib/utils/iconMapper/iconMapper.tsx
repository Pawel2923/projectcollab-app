import type React from "react";

import { iconMap } from "@/lib/utils/iconMapper/iconMap";

export function mapIcon(iconKey: string): React.ReactNode | undefined {
  return iconMap?.[iconKey];
}
