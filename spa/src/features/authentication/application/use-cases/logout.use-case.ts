import type { QueryClient } from "@tanstack/react-query"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import { queryClient as defaultQueryClient } from "@/shared/api"
import { authGateway as defaultAuthGateway } from "../../infrastructure/adapters/http-auth-gateway"

type RedirectFn = (url: string) => void

const defaultRedirect: RedirectFn = (url: string) => {
  if (typeof window !== "undefined") {
    window.location.href = url
  }
}

export class LogoutUseCase {
  private readonly gateway: AuthGatewayPort
  private readonly queryClientInstance: QueryClient
  private readonly redirect: RedirectFn

  constructor(
    gateway: AuthGatewayPort = defaultAuthGateway,
    queryClientInstance: QueryClient = defaultQueryClient,
    redirect: RedirectFn = defaultRedirect
  ) {
    this.gateway = gateway
    this.queryClientInstance = queryClientInstance
    this.redirect = redirect
  }

  public async execute(): Promise<void> {
    try {
      await this.gateway.logout()
    } catch (error: unknown) {
      console.warn(
        "Backend logout request failed, proceeding with local cleanup",
        error
      )
    } finally {
      this.queryClientInstance.clear()
      this.redirect("/signin")
    }
  }
}

export const logoutUseCase = new LogoutUseCase()
