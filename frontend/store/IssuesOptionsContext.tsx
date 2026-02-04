"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

export type IssueSortOption = {
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export type IssueFilterOption = {
  field: string;
  value: string | string[];
  operator?:
    | "exact"
    | "partial"
    | "before"
    | "after"
    | "gt"
    | "lt"
    | "gte"
    | "lte";
};

interface IssuesOptionsContextType {
  sortOptions: IssueSortOption[];
  setSortOptions: (options: IssueSortOption[]) => void;
  filterOptions: IssueFilterOption[];
  setFilterOptions: (options: IssueFilterOption[]) => void;
}

const IssuesOptionsContext = createContext<
  IssuesOptionsContextType | undefined
>(undefined);

// Helper functions to encode/decode URL params
function encodeOptions<T>(options: T[]): string {
  if (options.length === 0) return "";
  return btoa(JSON.stringify(options));
}

function decodeOptions<T>(encoded: string): T[] {
  if (!encoded) return [];
  try {
    return JSON.parse(atob(encoded));
  } catch (e) {
    console.error("Failed to decode options:", e);
    return [];
  }
}

export function IssuesOptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from URL search params
  const [sortOptions, setSortOptionsState] = useState<IssueSortOption[]>(() => {
    const sortParam = searchParams.get("sort");
    return decodeOptions<IssueSortOption>(sortParam || "");
  });

  const [filterOptions, setFilterOptionsState] = useState<IssueFilterOption[]>(
    () => {
      const filterParam = searchParams.get("filter");
      return decodeOptions<IssueFilterOption>(filterParam || "");
    },
  );

  // Update URL when options change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (sortOptions.length > 0) {
      params.set("sort", encodeOptions(sortOptions));
    } else {
      params.delete("sort");
    }

    if (filterOptions.length > 0) {
      params.set("filter", encodeOptions(filterOptions));
    } else {
      params.delete("filter");
    }

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(newUrl, { scroll: false });
  }, [sortOptions, filterOptions, pathname, router, searchParams]);

  const setSortOptions = (options: IssueSortOption[]) => {
    setSortOptionsState(options);
  };

  const setFilterOptions = (options: IssueFilterOption[]) => {
    setFilterOptionsState(options);
  };

  console.log("IssuesOptionsContext - sortOptions:", sortOptions);
  console.log("IssuesOptionsContext - filterOptions:", filterOptions);

  return (
    <IssuesOptionsContext.Provider
      value={{ sortOptions, setSortOptions, filterOptions, setFilterOptions }}
    >
      {children}
    </IssuesOptionsContext.Provider>
  );
}

export function useIssuesOptions(): IssuesOptionsContextType | null {
  const context = useContext(IssuesOptionsContext);
  if (context === undefined) {
    return null;
  }
  return context;
}
