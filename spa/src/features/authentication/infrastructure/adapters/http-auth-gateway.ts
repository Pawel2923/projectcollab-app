import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import type { LoginCredentials } from "../../domain/models/credentials"
import type { User } from "../../domain/models/user"
import {
  apiClient as defaultApiClient,
  apiFetch as defaultApiFetch,
  onAuthFailure as defaultOnAuthFailure,
  refreshTokens as defaultRefreshTokens,
  type AuthFailureCallback,
} from "@/shared/api"
import type { ApiUserDto } from "../dto/user-api.dto"
import { UserMapper } from "../mappers/user.mapper"

interface HttpAuthGatewayDependencies {
  readonly apiClient?: typeof defaultApiClient
  readonly apiFetch?: typeof defaultApiFetch
  readonly refreshTokens?: typeof defaultRefreshTokens
  readonly onAuthFailure?: typeof defaultOnAuthFailure
}

export class HttpAuthGateway implements AuthGatewayPort {
  private readonly client: typeof defaultApiClient
  private readonly fetcher: typeof defaultApiFetch
  private readonly refreshTokenFn: typeof defaultRefreshTokens
  private readonly onAuthFailureFn: typeof defaultOnAuthFailure

  constructor(dependencies: HttpAuthGatewayDependencies = {}) {
    this.client = dependencies.apiClient ?? defaultApiClient
    this.fetcher = dependencies.apiFetch ?? defaultApiFetch
    this.refreshTokenFn = dependencies.refreshTokens ?? defaultRefreshTokens
    this.onAuthFailureFn = dependencies.onAuthFailure ?? defaultOnAuthFailure
  }

  public async login(credentials: LoginCredentials): Promise<void> {
    await this.fetcher("/core-api/auth/login", {
      method: "POST",
      body: credentials,
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
  }

  public async logout(): Promise<void> {
    await this.fetcher("/core-api/auth/logout", {
      method: "POST",
      body: {},
      skipAuthRefresh: true,
      skipAuthRedirect: true,
    })
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
    return this.refreshTokenFn()
  }

  public onAuthFailure(callback: AuthFailureCallback): () => void {
    return this.onAuthFailureFn(callback)
  }
}

export const authGateway = new HttpAuthGateway()
