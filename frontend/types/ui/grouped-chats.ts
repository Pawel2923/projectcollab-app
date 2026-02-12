import type { NavigationItem } from "./navigation-item";

export interface GroupedChats {
  general: NavigationItem[];
  direct: NavigationItem[];
  group: NavigationItem[];
}
