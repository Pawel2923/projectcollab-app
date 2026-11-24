import type { QueryClient } from "@tanstack/react-query"
import type { AuthGatewayPort } from "../../domain/ports/auth-gateway.port"
import {
  buildAppUrl,
  DEFAULT_POST_LOGOUT_REDIRECT,
} from "../../domain/services/auth-navigation"
import { authKeys } from "../auth-keys"
import { queryClient as defaultQueryClient } from "@/shared/api"
import { authGateway as defaultAuthGateway } from "../../infrastructure/adapters/http-auth-gateway"

export type LogoutRedirectFn = (url: string) => void | Promise<void>

export interface LogoutExecuteOptions {
  readonly onCleanup?: () => void
  readonly redirect?: LogoutRedirectFn
}

const defaultRedirect: LogoutRedirectFn = (url: string) => {
  if (typeof window !== "undefined") {
    const baseUrl = import.meta.env?.BASE_URL ?? "/"
    window.location.href = buildAppUrl(url, baseUrl)
  }
}

export class LogoutUseCase {
  private readonly gateway: AuthGatewayPort
  private readonly queryClientInstance: QueryClient
  private readonly redirect: LogoutRedirectFn
  private inFlightPromise: Promise<void> | null = null

  constructor(
    gateway: AuthGatewayPort = defaultAuthGateway,
    queryClientInstance: QueryClient = defaultQueryClient,
    redirect: LogoutRedirectFn = defaultRedirect
  ) {
    this.gateway = gateway
    this.queryClientInstance = queryClientInstance
    this.redirect = redirect
  }

  public execute(options: LogoutExecuteOptions = {}): Promise<void> {
    if (this.inFlightPromise) {
      return this.inFlightPromise
    }

    this.inFlightPromise = this.performLogout(options).finally(() => {
      this.inFlightPromise = null
    })

    return this.inFlightPromise
  }

  private async performLogout(options: LogoutExecuteOptions): Promise<void> {
    try {
      // No refresh token argument — the browser sends the cookie automatically.
      await this.gateway.logout()
    } catch (error: unknown) {
      console.warn(
        "Backend logout request failed, proceeding with local cleanup",
        error
      )
    } finally {
      await this.queryClientInstance.cancelQueries()
      this.queryClientInstance.clear()
      this.queryClientInstance.setQueryData(authKeys.currentUser(), null)
      options.onCleanup?.()
      const redirectFn = options.redirect ?? this.redirect
      await redirectFn(DEFAULT_POST_LOGOUT_REDIRECT)
    }
  }
}

export const logoutUseCase = new LogoutUseCase()
