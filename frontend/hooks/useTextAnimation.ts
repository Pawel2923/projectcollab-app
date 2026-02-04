import { useMemo } from "react";

/**
 * Custom hook for text animation classes in collapsible sidebar
 */
export function useTextAnimation(isExpanded: boolean, delay?: string) {
  return useMemo(() => {
    const baseClasses =
      "transition-all duration-300 ease-in-out whitespace-nowrap text-sm font-semibold overflow-hidden";
    const expandedClasses = "opacity-100 translate-x-0 max-w-full";
    const collapsedClasses = "opacity-0 -translate-x-2 max-w-0";
    const delayClass = delay ? `delay-${delay}` : "";

    return `${baseClasses} ${delayClass} ${isExpanded ? expandedClasses : collapsedClasses}`;
  }, [isExpanded, delay]);
}
