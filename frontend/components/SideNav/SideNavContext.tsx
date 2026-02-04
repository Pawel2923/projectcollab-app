"use client";

import React, { createContext, useContext, useMemo } from "react";

// State context for isExpanded (changes frequently)
interface SideNavStateContextType {
  isExpanded: boolean;
}

const SideNavStateContext = createContext<SideNavStateContextType | undefined>(
  undefined,
);

// Data context for static configuration (rarely changes)
interface SideNavDataContextType {
  contentId: string;
  contentType: "project" | "chat";
  organizationId?: string;
  headerTitle?: string;
  headerAcronym?: string;
}

const SideNavDataContext = createContext<SideNavDataContextType | undefined>(
  undefined,
);

// Provider for state context
export function SideNavStateProvider({
  isExpanded,
  children,
}: {
  isExpanded: boolean;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ isExpanded }), [isExpanded]);

  return (
    <SideNavStateContext.Provider value={value}>
      {children}
    </SideNavStateContext.Provider>
  );
}

// Provider for data context
export function SideNavDataProvider({
  contentId,
  contentType,
  organizationId,
  headerTitle,
  headerAcronym,
  children,
}: {
  contentId: string;
  contentType: "project" | "chat";
  organizationId?: string;
  headerTitle?: string;
  headerAcronym?: string;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      contentId,
      contentType,
      organizationId,
      headerTitle,
      headerAcronym,
    }),
    [contentId, contentType, organizationId, headerTitle, headerAcronym],
  );

  return (
    <SideNavDataContext.Provider value={value}>
      {children}
    </SideNavDataContext.Provider>
  );
}

// Hook to access state context
export function useSideNavState(): SideNavStateContextType {
  const context = useContext(SideNavStateContext);
  if (!context) {
    throw new Error("useSideNavState must be used within SideNavStateProvider");
  }
  return context;
}

// Hook to access data context
export function useSideNavData(): SideNavDataContextType {
  const context = useContext(SideNavDataContext);
  if (!context) {
    throw new Error("useSideNavData must be used within SideNavDataProvider");
  }
  return context;
}
