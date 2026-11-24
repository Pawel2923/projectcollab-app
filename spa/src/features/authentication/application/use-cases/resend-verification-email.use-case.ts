import { err, type Result } from "@/shared/result"
import {
  createEmailRequiredError,
  type ResendVerificationEmailError,
} from "../../domain/errors/auth-error"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { authGateway as defaultAuthGateway } from "../../infrastructure/adapters/http-auth-gateway"

export class ResendVerificationEmailUseCase {
  private readonly gateway: AuthGatewayPort

  constructor(gateway: AuthGatewayPort = defaultAuthGateway) {
    this.gateway = gateway
  }

  public async execute(
    email: string
  ): Promise<Result<void, ResendVerificationEmailError>> {
    const trimmed = email.trim()
    if (!trimmed) {
      return err(createEmailRequiredError())
    }

    return this.gateway.resendVerificationEmail(trimmed)
  }
}

export const resendVerificationEmailUseCase =
  new ResendVerificationEmailUseCase()
