import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import type { User } from "@/types/api/user"

export interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

export const UserContext = React.createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: false,
})

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/core-api/users/me", {
      headers: {
        Accept: "application/ld+json, application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data ?? null
  } catch {
    return null
  }
}

export function UserProvider({
  children,
  initial = null,
}: {
  children: React.ReactNode
  initial?: User | null
}) {
  const [userState, setUserState] = React.useState<User | null>(initial)

  const { data: fetchedUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    initialData: initial ?? undefined,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const currentUser = userState ?? fetchedUser ?? null

  const value = React.useMemo(
    () => ({
      user: currentUser,
      setUser: setUserState,
      isLoading,
    }),
    [currentUser, isLoading]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserContext() {
  const context = React.useContext(UserContext)
  if (context === undefined) {
    return null
  }
  return context
}
