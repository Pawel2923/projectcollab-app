"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext } from "react";

interface OrganizationContextType {
  organizationId: string;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined,
);

export function OrganizationProvider({
  children,
  organizationId,
}: {
  children: ReactNode;
  organizationId: string;
}) {
  return (
    <OrganizationContext.Provider value={{ organizationId }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextType | null {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    return null;
  }
  return context;
}
