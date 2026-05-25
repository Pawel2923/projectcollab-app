"use client";

import React, { createContext, useContext, useState } from "react";

import { fetchApiLog } from "@/services/log/fetch-api-log";

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

export function IssuesOptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sortOptions, setSortOptionsState] = useState<IssueSortOption[]>([]);
  const [filterOptions, setFilterOptionsState] = useState<IssueFilterOption[]>(
    [],
  );

  const setSortOptions = (options: IssueSortOption[]) => {
    setSortOptionsState(options);
  };

  const setFilterOptions = (options: IssueFilterOption[]) => {
    setFilterOptionsState(options);
  };

  React.useEffect(() => {
    fetchApiLog({
      level: "debug",
      message: "IssuesOptionsContext updated",
      serviceName: "IssuesOptionsContext",
      context: {
        sortOptions,
        filterOptions,
      },
    });
  }, [filterOptions, sortOptions]);

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
