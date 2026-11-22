// Domain models, ports, and services
export type { User, UserLike } from "./domain/models/user"
export type { LoginCredentials } from "./domain/models/credentials"
export type { AuthGatewayPort } from "./domain/ports/auth-gateway.port"
export {
  AuthError,
  SessionExpiredError,
  InvalidCredentialsError,
} from "./domain/errors/auth-error"
export {
  generateUserInitials,
  getUserDisplayName,
  getUserGreeting,
} from "./domain/services/user-display"
export {
  getPostLoginRedirect,
  DEFAULT_POST_LOGIN_REDIRECT,
} from "./domain/services/auth-navigation"

// Application use cases, validation, and query keys
import { logoutUseCase } from "./application/use-cases/logout.use-case"

export { authKeys } from "./application/auth-keys"
export {
  LoginUseCase,
  loginUseCase,
} from "./application/use-cases/login.use-case"
export {
  LogoutUseCase,
  logoutUseCase,
} from "./application/use-cases/logout.use-case"
export {
  GetCurrentUserUseCase,
  getCurrentUserUseCase,
} from "./application/use-cases/get-current-user.use-case"
export {
  RefreshTokensUseCase,
  refreshTokensUseCase,
} from "./application/use-cases/refresh-tokens.use-case"
export {
  signInSchema,
  type SignInFormData,
} from "./application/validation/sign-in.schema"

// Infrastructure
export {
  HttpAuthGateway,
  authGateway,
} from "./infrastructure/adapters/http-auth-gateway"
export { UserMapper } from "./infrastructure/mappers/user.mapper"
export type {
  ApiUserDto,
  ApiOAuthProvidersDto,
} from "./infrastructure/dto/user-api.dto"

// Presentation
export {
  UserContext,
  UserProvider,
  useUserContext,
  fetchCurrentUser,
  type UserContextType,
} from "./presentation/context/UserContext"
export { Avatar, type AvatarProps } from "./presentation/components/Avatar"
export {
  UserSettings,
  type UserSettingsProps,
} from "./presentation/components/UserSettings"
export {
  PasswordToggle,
  type PasswordToggleProps,
} from "./presentation/components/PasswordToggle"
export {
  SignInForm,
  type SignInFormProps,
} from "./presentation/components/SignInForm"
export {
  SignInView,
  type SignInViewProps,
} from "./presentation/components/SignInView"
export { SignUpView } from "./presentation/components/SignUpView"

/**
 * Initiates logout, clearing query cache and redirecting to sign-in.
 * The refresh_token cookie is sent automatically — no token argument needed.
 * @deprecated Passing a refreshToken argument is a no-op; will be removed in a future version.
 */
export async function logout(_refreshToken?: string): Promise<void> {
  await logoutUseCase.execute()
}
