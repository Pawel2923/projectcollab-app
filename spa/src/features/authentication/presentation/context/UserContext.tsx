import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import type { User } from "../../domain/models/user"
import { getCurrentUserUseCase } from "../../application/use-cases/get-current-user.use-case"
import {
  logoutUseCase,
  type LogoutRedirectFn,
} from "../../application/use-cases/logout.use-case"
import { authGateway } from "../../infrastructure/adapters/http-auth-gateway"
import { authKeys } from "../../application/auth-keys"

export interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
  isLoggingOut: boolean
  logout: () => Promise<void>
}

export const UserContext = React.createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: false,
  isLoggingOut: false,
  logout: async () => {},
})

export async function fetchCurrentUser(): Promise<User | null> {
  return getCurrentUserUseCase.execute()
}

export function UserProvider({
  children,
  initial = null,
  onLogoutRedirect,
}: {
  children: React.ReactNode
  initial?: User | null
  onLogoutRedirect?: LogoutRedirectFn
}) {
  const [userState, setUserState] = React.useState<User | null>(initial)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  React.useEffect(() => {
    return authGateway.onAuthFailure(() => {
      setUserState(null)
    })
  }, [])

  const { data: fetchedUser, isLoading } = useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: fetchCurrentUser,
    initialData: initial ?? undefined,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const currentUser = userState ?? fetchedUser ?? null

  const handleLogout = React.useCallback(async () => {
    setIsLoggingOut(true)
    try {
      await logoutUseCase.execute({
        onCleanup: () => {
          setUserState(null)
        },
        redirect: onLogoutRedirect,
      })
    } finally {
      setIsLoggingOut(false)
    }
  }, [onLogoutRedirect])

  const value = React.useMemo(
    () => ({
      user: currentUser,
      setUser: setUserState,
      isLoading,
      isLoggingOut,
      logout: handleLogout,
    }),
    [currentUser, handleLogout, isLoading, isLoggingOut]
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
