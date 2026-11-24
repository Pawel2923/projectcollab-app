import { AuthError } from "../../domain/errors/auth-error"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { authGateway as defaultAuthGateway } from "../../infrastructure/adapters/http-auth-gateway"

export class ResendVerificationEmailUseCase {
  private readonly gateway: AuthGatewayPort

  constructor(gateway: AuthGatewayPort = defaultAuthGateway) {
    this.gateway = gateway
  }

  public async execute(email: string): Promise<void> {
    const trimmed = email.trim()
    if (!trimmed) {
      throw new AuthError("Email is required")
    }

    await this.gateway.resendVerificationEmail(trimmed)
  }
}

export const resendVerificationEmailUseCase =
  new ResendVerificationEmailUseCase()
