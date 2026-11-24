import type { QueryClient } from "@tanstack/react-query"
import { queryClient as defaultQueryClient } from "@/shared/api"
import type {
  EmailVerificationResult,
  VerifyEmailSearchParams,
} from "../../domain/models/email-verification"
import { parseVerifyEmailParams } from "../../domain/services/email-verification"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { authGateway as defaultAuthGateway } from "../../infrastructure/adapters/http-auth-gateway"
import { authKeys } from "../auth-keys"

export class VerifyEmailUseCase {
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
    rawParams: VerifyEmailSearchParams | Record<string, unknown>
  ): Promise<EmailVerificationResult> {
    const validParams = parseVerifyEmailParams(rawParams)
    if (!validParams) {
      return { status: "failed", reason: "invalid_link" }
    }

    const result = await this.gateway.verifyEmail(validParams)

    if (result.status === "verified") {
      await this.queryClientInstance.invalidateQueries({
        queryKey: authKeys.currentUser(),
      })
    }

    return result
  }
}

export const verifyEmailUseCase = new VerifyEmailUseCase()
