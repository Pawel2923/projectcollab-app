import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { authGateway as defaultAuthGateway } from "../../infrastructure/adapters/http-auth-gateway"

export class RefreshTokensUseCase {
  private readonly gateway: AuthGatewayPort

  constructor(gateway: AuthGatewayPort = defaultAuthGateway) {
    this.gateway = gateway
  }

  public async execute(): Promise<boolean> {
    return this.gateway.refreshTokens()
  }
}

export const refreshTokensUseCase = new RefreshTokensUseCase()
