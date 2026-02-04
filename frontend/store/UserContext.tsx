"use client";

import React, { createContext, useContext, useState } from "react";

import type { User } from "@/lib/types/api";

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function UserProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: User | null;
}) {
  const [user, setUser] = useState(initial);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    return null;
  }

  return context;
}
