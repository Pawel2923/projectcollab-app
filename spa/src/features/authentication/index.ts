// Domain models, ports, and services
export type { User, UserLike } from "./domain/models/user"
export type {
  LoginCredentials,
  SignUpCredentials,
} from "./domain/models/credentials"
export type {
  EmailVerificationFailureReason,
  EmailVerificationResult,
  VerifyEmailParams,
  VerifyEmailSearchParams,
} from "./domain/models/email-verification"
export type { AuthGatewayPort } from "./domain/ports/auth-gateway.port"
export {
  AuthError,
  SessionExpiredError,
  InvalidCredentialsError,
  TooManyRequestsError,
  UserAlreadyExistsError,
} from "./domain/errors/auth-error"
export {
  generateUserInitials,
  getUserDisplayName,
  getUserGreeting,
} from "./domain/services/user-display"
export {
  buildAppUrl,
  getPostLoginRedirect,
  DEFAULT_POST_LOGIN_REDIRECT,
  DEFAULT_POST_LOGOUT_REDIRECT,
} from "./domain/services/auth-navigation"
export {
  getVerifyEmailKey,
  normalizeVerifyEmailSearchParams,
  parseVerifyEmailParams,
} from "./domain/services/email-verification"

// Application use cases, validation, and query keys
import { logoutUseCase } from "./application/use-cases/logout.use-case"

export { authKeys } from "./application/auth-keys"
export {
  LoginUseCase,
  loginUseCase,
} from "./application/use-cases/login.use-case"
export {
  SignUpUseCase,
  signUpUseCase,
} from "./application/use-cases/sign-up.use-case"
export {
  ResendVerificationEmailUseCase,
  resendVerificationEmailUseCase,
} from "./application/use-cases/resend-verification-email.use-case"
export {
  VerifyEmailUseCase,
  verifyEmailUseCase,
} from "./application/use-cases/verify-email.use-case"
export {
  LogoutUseCase,
  logoutUseCase,
  type LogoutExecuteOptions,
  type LogoutRedirectFn,
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
export {
  signUpSchema,
  type SignUpFormData,
} from "./application/validation/sign-up.schema"
export {
  resendVerificationEmailSchema,
  type ResendVerificationEmailFormData,
} from "./application/validation/resend-verification-email.schema"

// Infrastructure
export {
  HttpAuthGateway,
  authGateway,
} from "./infrastructure/adapters/http-auth-gateway"
export { UserMapper } from "./infrastructure/mappers/user.mapper"
export { VerifyEmailMapper } from "./infrastructure/mappers/verify-email.mapper"
export type {
  ApiUserDto,
  ApiOAuthProvidersDto,
} from "./infrastructure/dto/user-api.dto"
export type { ApiVerifyEmailResponseDto } from "./infrastructure/dto/verify-email-api.dto"

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
export {
  SignUpForm,
  type SignUpFormProps,
} from "./presentation/components/SignUpForm"
export {
  SignUpView,
  type SignUpViewProps,
} from "./presentation/components/SignUpView"
export {
  ResendVerifyEmailButton,
  type ResendVerifyEmailButtonProps,
} from "./presentation/components/ResendVerifyEmailButton"
export {
  VerifyEmailView,
  type VerifyEmailViewProps,
} from "./presentation/components/VerifyEmailView"
export {
  VerifyEmailConfirmView,
  type VerifyEmailConfirmViewProps,
  type VerifyEmailConfirmState,
} from "./presentation/components/VerifyEmailConfirmView"
export {
  LogoutView,
  type LogoutViewProps,
} from "./presentation/components/LogoutView"
export {
  requireAuth,
  requireGuest,
  formatRedirectUrl,
  type AuthGuardLocation,
  type AuthGuardOptions,
  type GuestGuardOptions,
} from "./presentation/guards/auth-guard"

/**
 * Initiates logout, clearing query cache and redirecting to sign-in.
 * The refresh_token cookie is sent automatically — no token argument needed.
 * @deprecated Passing a refreshToken argument is a no-op; will be removed in a future version.
 */
export async function logout(_refreshToken?: string): Promise<void> {
  await logoutUseCase.execute()
}
