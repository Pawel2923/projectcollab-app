import type { QueryClient } from "@tanstack/react-query"
import type { SignUpCredentials } from "../../domain/models/credentials"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { queryClient as defaultQueryClient } from "@/shared/api"
import { authGateway as defaultAuthGateway } from "../../infrastructure/adapters/http-auth-gateway"
import { authKeys } from "../auth-keys"

export class SignUpUseCase {
  private readonly gateway: AuthGatewayPort
  private readonly queryClientInstance: QueryClient

  constructor(
    gateway: AuthGatewayPort = defaultAuthGateway,
    queryClientInstance: QueryClient = defaultQueryClient
  ) {
    this.gateway = gateway
    this.queryClientInstance = queryClientInstance
  }

  public async execute(credentials: SignUpCredentials): Promise<void> {
    await this.gateway.signUp(credentials)
    await this.gateway.login(credentials)
    await this.queryClientInstance.invalidateQueries({
      queryKey: authKeys.currentUser(),
    })
  }
}

export const signUpUseCase = new SignUpUseCase()
