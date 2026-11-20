import type { User } from "../../domain/models/user"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { authGateway as defaultAuthGateway } from "../../infrastructure/adapters/http-auth-gateway"

export class GetCurrentUserUseCase {
  private readonly gateway: AuthGatewayPort

  constructor(gateway: AuthGatewayPort = defaultAuthGateway) {
    this.gateway = gateway
  }

  public async execute(): Promise<User | null> {
    return this.gateway.getCurrentUser()
  }
}

export const getCurrentUserUseCase = new GetCurrentUserUseCase()
