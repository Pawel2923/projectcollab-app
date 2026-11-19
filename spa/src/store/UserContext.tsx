import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { authService } from "@/services/auth-service"
import type { User } from "@/types/api/user"

export interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
  logout: () => Promise<void>
}

export const UserContext = React.createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: false,
  logout: async () => {},
})

export async function fetchCurrentUser(): Promise<User | null> {
  return authService.fetchCurrentUser()
}

export function UserProvider({
  children,
  initial = null,
}: {
  children: React.ReactNode
  initial?: User | null
}) {
  const [userState, setUserState] = React.useState<User | null>(initial)

  React.useEffect(() => {
    return authService.onAuthFailure(() => {
      setUserState(null)
    })
  }, [])

  const { data: fetchedUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    initialData: initial ?? undefined,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const currentUser = userState ?? fetchedUser ?? null

  const handleLogout = React.useCallback(async () => {
    await authService.logout()
  }, [])

  const value = React.useMemo(
    () => ({
      user: currentUser,
      setUser: setUserState,
      isLoading,
      logout: handleLogout,
    }),
    [currentUser, handleLogout, isLoading]
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
