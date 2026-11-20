import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { authGateway as defaultAuthGateway } from "../../infrastructure/adapters/http-auth-gateway"

export class RefreshTokensUseCase {
  private readonly gateway: AuthGatewayPort

  constructor(gateway: AuthGatewayPort = defaultAuthGateway) {
    this.gateway = gateway
  }

  public async execute(refreshToken?: string): Promise<boolean> {
    const token = typeof refreshToken === "string" ? refreshToken : undefined
    return this.gateway.refreshTokens(token)
  }
}

export const refreshTokensUseCase = new RefreshTokensUseCase()
