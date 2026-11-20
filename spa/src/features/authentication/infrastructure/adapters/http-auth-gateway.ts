import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import type { LoginCredentials } from "../../domain/models/credentials"
import type { User } from "../../domain/models/user"
import {
  apiClient as defaultApiClient,
  apiFetch as defaultApiFetch,
  onAuthFailure as defaultOnAuthFailure,
  onTokenRefreshed as defaultOnTokenRefreshed,
  refreshTokens as defaultRefreshTokens,
  setRefreshTokenResolver as defaultSetRefreshTokenResolver,
  type AuthFailureCallback,
} from "@/shared/api"
import type { ApiUserDto } from "../dto/user-api.dto"
import { UserMapper } from "../mappers/user.mapper"

interface HttpAuthGatewayDependencies {
  readonly apiClient?: typeof defaultApiClient
  readonly apiFetch?: typeof defaultApiFetch
  readonly refreshTokens?: typeof defaultRefreshTokens
  readonly onAuthFailure?: typeof defaultOnAuthFailure
  readonly getRefreshToken?: () => string | null
  readonly setRefreshToken?: (token: string | null) => void
}

interface LoginResponseDto {
  readonly token?: string
  readonly refresh_token?: string
}

export class HttpAuthGateway implements AuthGatewayPort {
  private readonly client: typeof defaultApiClient
  private readonly fetcher: typeof defaultApiFetch
  private readonly refreshTokenFn: typeof defaultRefreshTokens
  private readonly onAuthFailureFn: typeof defaultOnAuthFailure
  private readonly getRefreshTokenFn?: () => string | null
  private readonly setRefreshTokenFn?: (token: string | null) => void
  private currentRefreshToken: string | null = null

  constructor(dependencies: HttpAuthGatewayDependencies = {}) {
    this.client = dependencies.apiClient ?? defaultApiClient
    this.fetcher = dependencies.apiFetch ?? defaultApiFetch
    this.refreshTokenFn = dependencies.refreshTokens ?? defaultRefreshTokens
    this.onAuthFailureFn = dependencies.onAuthFailure ?? defaultOnAuthFailure
    this.getRefreshTokenFn = dependencies.getRefreshToken
    this.setRefreshTokenFn = dependencies.setRefreshToken

    if (!dependencies.refreshTokens && typeof defaultSetRefreshTokenResolver === "function") {
      defaultSetRefreshTokenResolver(() => this.getRefreshToken())
    }
    if (typeof defaultOnTokenRefreshed === "function") {
      defaultOnTokenRefreshed((newToken) => {
        this.setRefreshToken(newToken)
      })
    }
  }

  public getRefreshToken(): string | null {
    return this.getRefreshTokenFn ? this.getRefreshTokenFn() : this.currentRefreshToken
  }

  public setRefreshToken(token: string | null): void {
    if (this.setRefreshTokenFn) {
      this.setRefreshTokenFn(token)
    }
    this.currentRefreshToken = token
  }

  public async login(credentials: LoginCredentials): Promise<void> {
    const response = await this.fetcher<LoginResponseDto>("/core-api/auth/login", {
      method: "POST",
      body: credentials,
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
    if (response?.refresh_token) {
      this.setRefreshToken(response.refresh_token)
    }
  }

  public async logout(refreshToken?: string): Promise<void> {
    const token = refreshToken ?? this.getRefreshToken() ?? ""
    try {
      await this.fetcher("/core-api/auth/logout", {
        method: "POST",
        body: { refresh_token: token },
        skipAuthRefresh: true,
        skipAuthRedirect: true,
      })
    } finally {
      this.setRefreshToken(null)
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

  public async refreshTokens(refreshToken?: string): Promise<boolean> {
    const token = refreshToken ?? this.getRefreshToken() ?? ""
    return this.refreshTokenFn(token)
  }

  public onAuthFailure(callback: AuthFailureCallback): () => void {
    return this.onAuthFailureFn(callback)
  }
}

export const authGateway = new HttpAuthGateway()
