import type { QueryClient } from "@tanstack/react-query"
import { ok, type Result } from "@/shared/result"
import type { LoginError } from "../../domain/errors/auth-error"
import type { LoginCredentials } from "../../domain/models/credentials"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { queryClient as defaultQueryClient } from "@/shared/api"
import { authGateway as defaultAuthGateway } from "../../infrastructure/adapters/http-auth-gateway"
import { authKeys } from "../auth-keys"

export class LoginUseCase {
  private readonly gateway: AuthGatewayPort
  private readonly queryClientInstance: QueryClient

  constructor(
    gateway: AuthGatewayPort = defaultAuthGateway,
    queryClientInstance: QueryClient = defaultQueryClient
  ) {
    this.gateway = gateway
    this.queryClientInstance = queryClientInstance
  }

  public async execute(
    credentials: LoginCredentials
  ): Promise<Result<void, LoginError>> {
    const result = await this.gateway.login(credentials)
    if (!result.ok) {
      return result
    }

    await this.queryClientInstance.invalidateQueries({
      queryKey: authKeys.currentUser(),
    })

    return ok()
  }
}

export const loginUseCase = new LoginUseCase()
