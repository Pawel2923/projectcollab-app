import * as React from "react"
import { Link } from "@tanstack/react-router"
import { AlertTriangle, Loader2, MailCheck, MailX } from "lucide-react"
import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype"
import { m } from "@/paraglide/messages"
import {
  BackButton,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui"
import type {
  EmailVerificationFailureReason,
  EmailVerificationResult,
  VerifyEmailSearchParams,
} from "../../domain/models/email-verification"
import {
  getVerifyEmailKey,
  parseVerifyEmailParams,
} from "../../domain/services/email-verification"
import {
  VerifyEmailUseCase,
  verifyEmailUseCase as defaultVerifyEmailUseCase,
} from "../../application/use-cases/verify-email.use-case"
import { clearCreatedIdentityEmail } from "../../infrastructure/storage/created-identity.storage"
import { useUserContext } from "../context/UserContext"

export type VerifyEmailConfirmState =
  { readonly status: "verifying" } | EmailVerificationResult

export interface VerifyEmailConfirmViewProps {
  params: VerifyEmailSearchParams
  verifyEmailUseCaseInstance?: VerifyEmailUseCase
  initialState?: VerifyEmailConfirmState
}

export interface VerificationFailureContent {
  readonly title: string
  readonly description: string
}

export function resolveVerificationFailureContent(
  reason: EmailVerificationFailureReason
): VerificationFailureContent {
  switch (reason) {
    case "invalid_link":
      return {
        title: m.auth_verify_email_confirm_invalid_link_title(),
        description: m.auth_verify_email_confirm_invalid_link_description(),
      }
    case "user_not_found":
      return {
        title: m.auth_verify_email_confirm_user_not_found_title(),
        description: m.auth_verify_email_confirm_user_not_found_description(),
      }
    case "verification_failed":
      return {
        title: m.auth_verify_email_confirm_failed_title(),
        description: m.auth_verify_email_confirm_failed_description(),
      }
    case "server_error":
      return {
        title: m.auth_verify_email_confirm_server_error_title(),
        description: m.auth_verify_email_confirm_server_error_description(),
      }
  }
}

export function VerifyEmailConfirmView({
  params,
  verifyEmailUseCaseInstance = defaultVerifyEmailUseCase,
  initialState,
}: VerifyEmailConfirmViewProps) {
  const userContext = useUserContext()
  const isAuthenticated = Boolean(userContext?.user)

  const parsedParams = React.useMemo(
    () => parseVerifyEmailParams(params),
    [params]
  )
  const paramsKey = parsedParams ? getVerifyEmailKey(parsedParams) : null

  const [attempt, setAttempt] = React.useState(0)
  const [resolved, setResolved] = React.useState<{
    readonly key: string
    readonly result: EmailVerificationResult
  } | null>(null)

  const attemptKey = paramsKey ? `${paramsKey}#${attempt}` : null

  const state: VerifyEmailConfirmState = initialState
    ? initialState
    : !parsedParams || !attemptKey
      ? { status: "failed", reason: "invalid_link" }
      : resolved?.key === attemptKey
        ? resolved.result
        : { status: "verifying" }

  const inFlightRef = React.useRef<{
    key: string
    promise: Promise<EmailVerificationResult>
  } | null>(null)

  React.useEffect(() => {
    if (initialState || !parsedParams || !attemptKey) {
      return
    }

    let isActive = true
    let promise: Promise<EmailVerificationResult>

    if (inFlightRef.current?.key === attemptKey) {
      promise = inFlightRef.current.promise
    } else {
      promise = verifyEmailUseCaseInstance.execute(parsedParams)
      inFlightRef.current = { key: attemptKey, promise }
    }

    promise.then((result) => {
      if (!isActive) {
        return
      }
      if (result.status === "verified") {
        clearCreatedIdentityEmail()
      }
      setResolved({ key: attemptKey, result })
    })

    return () => {
      isActive = false
    }
  }, [attemptKey, initialState, parsedParams, verifyEmailUseCaseInstance])

  const handleRetry = () => {
    inFlightRef.current = null
    setAttempt((prev) => prev + 1)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <BackButton href="/" />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
          aria-label={m.landing_nav_logotype_aria_label()}
        >
          <ProjectCollabLogotype />
        </Link>

        {state.status === "verifying" && (
          <Card className="w-full" role="status" aria-live="polite">
            <CardHeader className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Loader2 className="size-8 animate-spin" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">
                <h1>{m.auth_verify_email_confirm_verifying_title()}</h1>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>{m.auth_verify_email_confirm_verifying_description()}</p>
            </CardContent>
          </Card>
        )}

        {state.status === "verified" && (
          <Card className="w-full" role="status">
            <CardHeader className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <MailCheck className="size-8" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">
                <h1>{m.auth_verify_email_confirm_success_title()}</h1>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>{m.auth_verify_email_confirm_success_description()}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2">
              {isAuthenticated ? (
                <Button
                  className="w-full"
                  render={<Link to="/organizations" />}
                >
                  {m.auth_verify_email_confirm_go_to_app()}
                </Button>
              ) : (
                <Button className="w-full" render={<Link to="/signin" />}>
                  {m.auth_sign_in_link()}
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                render={<Link to="/" />}
              >
                {m.auth_verify_email_confirm_back_home()}
              </Button>
            </CardFooter>
          </Card>
        )}

        {state.status === "failed" &&
          (() => {
            const content = resolveVerificationFailureContent(state.reason)
            const IconComponent =
              state.reason === "server_error" ? AlertTriangle : MailX

            return (
              <Card className="w-full" role="alert">
                <CardHeader className="flex flex-col items-center gap-3 text-center">
                  <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                    <IconComponent className="size-8" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">
                    <h1>{content.title}</h1>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  <p>{content.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-2">
                  {state.reason === "server_error" && (
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleRetry}
                    >
                      {m.auth_verify_email_confirm_retry_button()}
                    </Button>
                  )}

                  {state.reason === "user_not_found" ? (
                    <>
                      <Button className="w-full" render={<Link to="/signup" />}>
                        {m.auth_sign_up_create_account()}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        render={<Link to="/signin" />}
                      >
                        {m.auth_sign_in_link()}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={
                          state.reason === "server_error"
                            ? "outline"
                            : "default"
                        }
                        className="w-full"
                        render={<Link to="/verify-email" />}
                      >
                        {m.auth_verify_email_confirm_request_new_link()}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        render={<Link to="/signin" />}
                      >
                        {m.auth_sign_in_link()}
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            )
          })()}
      </div>
    </div>
  )
}
