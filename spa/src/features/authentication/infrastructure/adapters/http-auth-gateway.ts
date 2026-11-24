import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import type {
  LoginCredentials,
  SignUpCredentials,
} from "../../domain/models/credentials"
import type {
  EmailVerificationResult,
  VerifyEmailParams,
} from "../../domain/models/email-verification"
import type { User } from "../../domain/models/user"
import {
  InvalidCredentialsError,
  TooManyRequestsError,
  UserAlreadyExistsError,
} from "../../domain/errors/auth-error"
import {
  ApiError,
  SYMFONY_VIOLATION_CODES,
  apiClient as defaultApiClient,
  apiFetch as defaultApiFetch,
  onAuthFailure as defaultOnAuthFailure,
  refreshTokens as defaultRefreshTokens,
  type AuthFailureCallback,
} from "@/shared/api"
import { getAppLocale as defaultGetAppLocale, type AppLocale } from "@/shared/i18n"
import type { ApiUserDto } from "../dto/user-api.dto"
import type { ApiVerifyEmailResponseDto } from "../dto/verify-email-api.dto"
import { UserMapper } from "../mappers/user.mapper"
import { VerifyEmailMapper } from "../mappers/verify-email.mapper"

interface HttpAuthGatewayDependencies {
  readonly apiClient?: typeof defaultApiClient
  readonly apiFetch?: typeof defaultApiFetch
  readonly refreshTokens?: typeof defaultRefreshTokens
  readonly onAuthFailure?: typeof defaultOnAuthFailure
  readonly getLocale?: () => AppLocale
}

export class HttpAuthGateway implements AuthGatewayPort {
  private readonly client: typeof defaultApiClient
  private readonly fetcher: typeof defaultApiFetch
  private readonly refreshTokenFn: typeof defaultRefreshTokens
  private readonly onAuthFailureFn: typeof defaultOnAuthFailure
  private readonly getLocaleFn: () => AppLocale

  constructor(dependencies: HttpAuthGatewayDependencies = {}) {
    this.client = dependencies.apiClient ?? defaultApiClient
    this.fetcher = dependencies.apiFetch ?? defaultApiFetch
    this.refreshTokenFn = dependencies.refreshTokens ?? defaultRefreshTokens
    this.onAuthFailureFn = dependencies.onAuthFailure ?? defaultOnAuthFailure
    this.getLocaleFn = dependencies.getLocale ?? defaultGetAppLocale
  }

  public async login(credentials: LoginCredentials): Promise<void> {
    try {
      await this.fetcher("/core-api/auth/login", {
        method: "POST",
        body: credentials,
        skipAuthRefresh: true,
        skipAuthRedirect: true,
      })
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        throw new InvalidCredentialsError("Invalid credentials")
      }
      throw error
    }
    // Tokens are set as HTTP-Only cookies by the server — nothing to store locally.
  }

  public async signUp(credentials: SignUpCredentials): Promise<void> {
    try {
      await this.fetcher("/core-api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
        },
        body: {
          email: credentials.email,
          plainPassword: credentials.password,
          locale: this.getLocaleFn(),
        },
        skipAuthRefresh: true,
        skipAuthRedirect: true,
      })
    } catch (error: unknown) {
      if (
        error instanceof ApiError &&
        (error.status === 422 || error.status === 400)
      ) {
        const isDuplicateEmailViolation = error.violations.some(
          (v) =>
            v.propertyPath === "email" &&
            (v.code === SYMFONY_VIOLATION_CODES.UNIQUE_ENTITY_NOT_UNIQUE ||
              /already exists|already in use|taken|istnieje|zajęt/i.test(
                v.message
              ))
        )
        const isDuplicateInDescription =
          /email.*already exists|already exists.*email/i.test(error.message)

        if (isDuplicateEmailViolation || isDuplicateInDescription) {
          throw new UserAlreadyExistsError(
            "User with this email already exists"
          )
        }
      }
      throw error
    }
  }

  public async resendVerificationEmail(email: string): Promise<void> {
    try {
      await this.fetcher("/core-api/verify-email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
        },
        body: {
          email,
          locale: this.getLocaleFn(),
        },
        skipAuthRefresh: true,
        skipAuthRedirect: true,
      })
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 429) {
        throw new TooManyRequestsError()
      }
      throw error
    }
  }

  public async verifyEmail(
    params: VerifyEmailParams
  ): Promise<EmailVerificationResult> {
    const query = new URLSearchParams({
      expires: params.expires,
      id: params.id,
      signature: params.signature,
      token: params.token,
    })

    try {
      const response = await this.fetcher<ApiVerifyEmailResponseDto>(
        `/core-api/verify-email?${query.toString()}`,
        {
          method: "POST",
          skipAuthRefresh: true,
          skipAuthRedirect: true,
        }
      )
      return VerifyEmailMapper.toDomain(response)
    } catch (error: unknown) {
      return VerifyEmailMapper.fromError(error)
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.fetcher("/core-api/auth/logout", {
        method: "POST",
        // No body — the refresh_token cookie is sent automatically by the browser.
        // The server reads it, revokes the token, and clears both auth cookies.
        skipAuthRefresh: true,
        skipAuthRedirect: true,
      })
    } catch {
      // Best-effort: server clears cookies regardless; local cleanup follows in the use-case.
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.client.get<ApiUserDto>("/core-api/users/me", {
        skipAuthRedirect: true,
      })
      return UserMapper.toDomainOrNull(response)
    } catch {
      return null
    }
  }

  public async refreshTokens(): Promise<boolean> {
    // The refresh_token cookie is sent automatically; no manual token needed.
    return this.refreshTokenFn()
  }

  public onAuthFailure(callback: AuthFailureCallback): () => void {
    return this.onAuthFailureFn(callback)
  }
}

export const authGateway = new HttpAuthGateway()
