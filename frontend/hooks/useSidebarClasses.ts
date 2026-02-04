import { useMemo } from "react";

/**
 * Custom hook for sidebar container classes
 */
export function useSidebarClasses(isExpanded: boolean) {
  return useMemo(() => {
    const baseClasses =
      "row-start-2 col-start-1 bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 md:top-21 h-[calc(100dvh)] md:h-[calc(100dvh-var(--spacing)*21)] overflow-y-auto overflow-x-hidden z-10 transition-all duration-300 ease-in-out origin-left hidden md:flex";
    const widthClass = isExpanded ? "md:w-43" : "md:w-15";

    return `${baseClasses} ${widthClass}`;
  }, [isExpanded]);
}
