import * as React from "react"
import { Loader2, MailCheck, MailX } from "lucide-react"

import { Button } from "@/shared/ui"
import { mapApiPlatformValidationError } from "@/shared/api"
import { m } from "@/paraglide/messages"
import { TooManyRequestsError } from "../../domain/errors/auth-error"
import {
  ResendVerificationEmailUseCase,
  resendVerificationEmailUseCase as defaultResendVerificationEmailUseCase,
} from "../../application/use-cases/resend-verification-email.use-case"
import { useUserContext } from "../context/UserContext"

const DEFAULT_COOLDOWN_SECONDS = 30
const CREATED_IDENTITY_STORAGE_KEY = "auth_created_identity"

export interface ResendVerifyEmailButtonProps {
  email?: string | null
  resendUseCaseInstance?: ResendVerificationEmailUseCase
  cooldownSeconds?: number
}

interface ResendFeedback {
  readonly kind: "success" | "error"
  readonly message: string
}

export function resolveResendVerifyEmailError(err: unknown): string {
  if (err instanceof TooManyRequestsError) {
    return m.auth_verify_email_too_many_requests()
  }

  const validationErrors = mapApiPlatformValidationError(err, {
    allowedFields: ["email"] as const,
  })
  if (validationErrors) {
    return (
      validationErrors.fieldErrors.email?.[0] ??
      validationErrors.formErrors[0] ??
      validationErrors.summary
    )
  }

  return m.auth_verify_email_send_failed()
}

function readStoredIdentityEmail(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const stored = window.sessionStorage.getItem(CREATED_IDENTITY_STORAGE_KEY)
    if (!stored || stored === "null") {
      return null
    }
    const trimmed = stored.trim()
    return trimmed.length > 0 ? trimmed : null
  } catch {
    return null
  }
}

export function ResendVerifyEmailButton({
  email: propEmail,
  resendUseCaseInstance = defaultResendVerificationEmailUseCase,
  cooldownSeconds = DEFAULT_COOLDOWN_SECONDS,
}: ResendVerifyEmailButtonProps) {
  const userContext = useUserContext()
  const [isPending, setIsPending] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)
  const [feedback, setFeedback] = React.useState<ResendFeedback | null>(null)

  React.useEffect(() => {
    if (cooldown <= 0) {
      return
    }

    const intervalId = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [cooldown])

  const handleClick = async () => {
    const targetEmail =
      propEmail?.trim() ||
      readStoredIdentityEmail() ||
      userContext?.user?.email?.trim() ||
      ""

    if (!targetEmail) {
      setFeedback({
        kind: "error",
        message: m.auth_verify_email_missing_identity(),
      })
      return
    }

    setIsPending(true)
    setFeedback(null)

    try {
      await resendUseCaseInstance.execute(targetEmail)
      setFeedback({
        kind: "success",
        message: m.auth_verify_email_sent(),
      })
      setCooldown(cooldownSeconds)
    } catch (err: unknown) {
      setFeedback({
        kind: "error",
        message: resolveResendVerifyEmailError(err),
      })
      if (err instanceof TooManyRequestsError) {
        setCooldown(cooldownSeconds)
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={handleClick}
          disabled={isPending || cooldown > 0}
          className="gap-2"
        >
          {m.auth_verify_email_resend_button()}
          {isPending && <Loader2 className="size-4 animate-spin" />}
        </Button>
        {cooldown > 0 && (
          <span className="text-sm text-muted-foreground">
            {m.auth_verify_email_cooldown({ seconds: cooldown })}
          </span>
        )}
      </div>

      {feedback && (
        <div
          role={feedback.kind === "error" ? "alert" : "status"}
          className={
            feedback.kind === "error"
              ? "flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive"
              : "flex items-center gap-2 rounded-md bg-primary/10 p-3 text-sm text-foreground"
          }
        >
          {feedback.kind === "error" ? (
            <MailX className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <MailCheck className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  )
}
