import type { ReactNode } from "react";

import type { Chat } from "../api/chat";

export interface NavigationItem {
  href: string;
  label: string;
  icon?: ReactNode;
  delay?: string;
  chat?: Chat;
}
