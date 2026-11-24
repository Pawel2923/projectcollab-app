import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, MailCheck, MailX } from "lucide-react"

import { Button, Input, Label } from "@/shared/ui"
import { mapApiPlatformViolations } from "@/shared/api"
import { m } from "@/paraglide/messages"
import {
  isAuthError,
  type ResendVerificationEmailError,
} from "../../domain/errors/auth-error"
import {
  ResendVerificationEmailUseCase,
  resendVerificationEmailUseCase as defaultResendVerificationEmailUseCase,
} from "../../application/use-cases/resend-verification-email.use-case"
import {
  resendVerificationEmailSchema,
  type ResendVerificationEmailFormData,
} from "../../application/validation/resend-verification-email.schema"
import {
  readCreatedIdentityEmail,
  saveCreatedIdentityEmail,
} from "../../infrastructure/storage/created-identity.storage"
import { useUserContext } from "../context/UserContext"

const DEFAULT_COOLDOWN_SECONDS = 30

export interface ResendVerifyEmailButtonProps {
  email?: string | null
  resendUseCaseInstance?: ResendVerificationEmailUseCase
  cooldownSeconds?: number
}

interface ResendFeedback {
  readonly kind: "success" | "error"
  readonly message: string
}

export function resolveResendVerifyEmailError(
  err: ResendVerificationEmailError | unknown
): string {
  if (isAuthError(err)) {
    if (err.kind === "too_many_requests") {
      return m.auth_verify_email_too_many_requests()
    }

    if (err.kind === "email_required") {
      return m.auth_verify_email_missing_identity()
    }

    if (err.kind === "validation_error") {
      const validationErrors = mapApiPlatformViolations(err.violations, {
        allowedFields: ["email"] as const,
      })
      return (
        validationErrors.fieldErrors.email?.[0] ??
        validationErrors.formErrors[0] ??
        validationErrors.summary
      )
    }
  }

  return m.auth_verify_email_send_failed()
}

export function ResendVerifyEmailButton({
  email: propEmail,
  resendUseCaseInstance = defaultResendVerificationEmailUseCase,
  cooldownSeconds = DEFAULT_COOLDOWN_SECONDS,
}: ResendVerifyEmailButtonProps) {
  const userContext = useUserContext()
  const [storedEmail, setStoredEmail] = React.useState<string | null>(() =>
    readCreatedIdentityEmail()
  )
  const [isPending, setIsPending] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)
  const [feedback, setFeedback] = React.useState<ResendFeedback | null>(null)

  const knownEmail =
    propEmail?.trim() || storedEmail || userContext?.user?.email?.trim() || null

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<ResendVerificationEmailFormData>({
    resolver: zodResolver(resendVerificationEmailSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  })

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

  const sendVerificationEmail = async (
    targetEmail: string,
    persistIdentity: boolean
  ) => {
    const trimmed = targetEmail.trim()
    if (!trimmed) {
      setFeedback({
        kind: "error",
        message: m.auth_verify_email_missing_identity(),
      })
      return
    }

    setIsPending(true)
    setFeedback(null)

    try {
      const result = await resendUseCaseInstance.execute(trimmed)
      if (!result.ok) {
        setFeedback({
          kind: "error",
          message: resolveResendVerifyEmailError(result.error),
        })
        if (result.error.kind === "too_many_requests") {
          setCooldown(cooldownSeconds)
        }
        return
      }

      if (persistIdentity) {
        saveCreatedIdentityEmail(trimmed)
        setStoredEmail(trimmed)
      }
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
    } finally {
      setIsPending(false)
    }
  }

  const handleDirectClick = async () => {
    const targetEmail =
      propEmail?.trim() ||
      readCreatedIdentityEmail() ||
      userContext?.user?.email?.trim() ||
      ""
    await sendVerificationEmail(targetEmail, false)
  }

  const handleManualSubmit = async (data: ResendVerificationEmailFormData) => {
    clearErrors()
    await sendVerificationEmail(data.email, true)
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {knownEmail ? (
        <div className="flex w-full flex-col items-center gap-2">
          <Button
            type="button"
            onClick={handleDirectClick}
            disabled={isPending || cooldown > 0}
            className="w-full gap-2"
          >
            {m.auth_verify_email_resend_button()}
            {isPending && <Loader2 className="size-4 animate-spin" />}
          </Button>
          {cooldown > 0 && (
            <span className="text-center text-sm text-muted-foreground">
              {m.auth_verify_email_cooldown({ seconds: cooldown })}
            </span>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(handleManualSubmit)}
          noValidate
          className="flex w-full flex-col gap-4"
        >
          <p className="text-center text-sm text-muted-foreground">
            {m.auth_verify_email_enter_email_hint()}
          </p>
          <div className="grid gap-2">
            <Label htmlFor="resend-verify-email">{m.auth_field_email()}</Label>
            <Input
              id="resend-verify-email"
              type="email"
              autoComplete="email"
              disabled={isPending || cooldown > 0}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "resend-verify-email-error" : undefined
              }
              {...register("email")}
            />
            {errors.email?.message && (
              <span
                id="resend-verify-email-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="flex w-full flex-col items-center gap-2">
            <Button
              type="submit"
              disabled={isPending || cooldown > 0}
              className="w-full gap-2"
            >
              {m.auth_verify_email_resend_button()}
              {isPending && <Loader2 className="size-4 animate-spin" />}
            </Button>
            {cooldown > 0 && (
              <span className="text-center text-sm text-muted-foreground">
                {m.auth_verify_email_cooldown({ seconds: cooldown })}
              </span>
            )}
          </div>
        </form>
      )}

      {feedback && (
        <div
          role={feedback.kind === "error" ? "alert" : "status"}
          className={
            feedback.kind === "error"
              ? "flex items-start gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive"
              : "flex items-start gap-2 rounded-md bg-primary/10 p-3 text-sm text-foreground"
          }
        >
          {feedback.kind === "error" ? (
            <MailX className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          ) : (
            <MailCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  )
}
