export {
  apiClient,
  apiFetch,
  formatApiUrl,
  notifyAuthFailure,
  notifyTokenRefreshed,
  onAuthFailure,
  onTokenRefreshed,
  refreshTokens,
  setRefreshTokenResolver,
  type ApiRequestOptions,
  type AuthFailureCallback,
  type RefreshTokenResolver,
  type TokenRefreshedCallback,
} from "./api-client"
export { createApiError, isApiError, type ApiError } from "./api-error"
export { queryClient } from "./query-client"
export {
  SYMFONY_VIOLATION_CODES,
  SYMFONY_VIOLATION_MESSAGE_MAP,
  type SymfonyViolationCode,
} from "./symfony-violation-codes"
export {
  mapApiPlatformValidationError,
  mapApiPlatformViolation,
  mapApiPlatformViolations,
  translateSymfonyViolation,
  type MappedValidationResult,
  type MappedViolation,
  type MapViolationsOptions,
} from "./violation-mapper"
export type { ApiPlatformErrorPayload, ApiPlatformViolation } from "./types"
