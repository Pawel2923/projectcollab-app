import type React from "react";

import type { Chat } from "@/lib/types/api";

export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  delay?: string;
  chat?: Chat;
}
