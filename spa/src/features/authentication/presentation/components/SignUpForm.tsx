import * as React from "react"
import { useForm, type UseFormSetError } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from "@/shared/ui"
import { GoogleLogoIcon, MicrosoftLogoIcon } from "@/assets/icons/icons"
import { cn } from "@/shared/lib/utils"
import { m } from "@/paraglide/messages"
import { mapApiPlatformValidationError } from "@/shared/api"
import { UserAlreadyExistsError } from "../../domain/errors/auth-error"
import {
  SignUpUseCase,
  signUpUseCase as defaultSignUpUseCase,
} from "../../application/use-cases/sign-up.use-case"
import {
  signUpSchema,
  type SignUpFormData,
} from "../../application/validation/sign-up.schema"
import { saveCreatedIdentityEmail } from "../../infrastructure/storage/created-identity.storage"
import { PasswordToggle } from "./PasswordToggle"

export interface SignUpFormProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  redirectUrl?: string
  error?: string
  signUpUseCaseInstance?: SignUpUseCase
  onSignUpStart?: () => void
  onSignUpError?: () => void
  onSuccess?: (email: string) => void
  onOAuthSignIn?: (provider: "microsoft-entra-id" | "google") => void
}

function resolveErrorMessage(error?: string): string | null {
  if (!error) return null
  if (error === "Configuration") return m.auth_configuration_error()
  if (error === "AccessDenied") return m.auth_access_denied_error()
  return m.auth_general_error()
}

export function applySignUpError(
  err: unknown,
  setError: UseFormSetError<SignUpFormData>
): void {
  if (err instanceof UserAlreadyExistsError) {
    setError("email", { message: m.auth_user_already_exists() })
    return
  }

  const validationErrors = mapApiPlatformValidationError(err, {
    fieldMap: { plainPassword: "password" },
    allowedFields: ["email", "password"] as const,
  })

  if (validationErrors) {
    const emailMessage = validationErrors.fieldErrors.email?.[0]
    const passwordMessage = validationErrors.fieldErrors.password?.[0]

    if (emailMessage) {
      setError("email", { message: emailMessage })
    }
    if (passwordMessage) {
      setError("password", { message: passwordMessage })
    }
    if (!emailMessage && !passwordMessage) {
      setError("root", {
        message: validationErrors.formErrors[0] ?? validationErrors.summary,
      })
    }
    return
  }

  setError("root", { message: m.auth_sign_up_general_error() })
}

export function SignUpForm({
  className,
  redirectUrl: _redirectUrl,
  error,
  signUpUseCaseInstance = defaultSignUpUseCase,
  onSignUpStart,
  onSignUpError,
  onSuccess,
  onOAuthSignIn,
  ...props
}: SignUpFormProps) {
  const navigate = useNavigate()
  const searchErrorMessage = resolveErrorMessage(error)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  })

  const onSubmit = async (data: SignUpFormData) => {
    clearErrors()
    onSignUpStart?.()
    try {
      await signUpUseCaseInstance.execute(data)
      saveCreatedIdentityEmail(data.email)
      if (onSuccess) {
        onSuccess(data.email)
      } else {
        await navigate({ to: "/verify-email" })
      }
    } catch (err: unknown) {
      onSignUpError?.()
      applySignUpError(err, setError)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {m.auth_sign_up_create_account()}
          </CardTitle>
          <CardDescription>{m.auth_sign_up_subtitle()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-6">
              {searchErrorMessage && (
                <div
                  className="rounded-md bg-destructive/15 p-3 text-center text-sm text-destructive"
                  role="alert"
                >
                  {searchErrorMessage}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full gap-3 p-3"
                  type="button"
                  onClick={() => onOAuthSignIn?.("microsoft-entra-id")}
                >
                  <MicrosoftLogoIcon size={21} />
                  {m.auth_sign_up_with_microsoft()}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2.5 p-3"
                  type="button"
                  onClick={() => onOAuthSignIn?.("google")}
                >
                  <GoogleLogoIcon size={21} />
                  {m.auth_sign_up_with_google()}
                </Button>
              </div>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  {m.auth_sign_in_or_continue_with()}
                </span>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="signup-email">{m.auth_field_email()}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "signup-email-error" : undefined
                    }
                    {...register("email")}
                  />
                  {errors.email?.message && (
                    <span
                      id="signup-email-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="signup-password">
                    {m.auth_field_password()}
                  </Label>
                  <PasswordToggle
                    id="signup-password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "signup-password-error" : undefined
                    }
                    {...register("password")}
                  />
                  {errors.password?.message && (
                    <span
                      id="signup-password-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.password.message}
                    </span>
                  )}
                </div>

                {errors.root?.message && (
                  <div
                    className="rounded-md bg-destructive/15 p-3 text-center text-sm text-destructive"
                    role="alert"
                  >
                    {errors.root.message}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {m.auth_sign_up_button()}
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {m.auth_already_have_account()}{" "}
                <Link
                  to="/signin"
                  className="font-medium text-dark-primary underline underline-offset-4 transition-colors hover:text-primary hover:opacity-85 dark:text-primary dark:hover:text-primary/80"
                >
                  {m.auth_sign_in_link()}
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-balance text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:hover:text-primary [&_a]:hover:opacity-85 dark:[&_a]:hover:text-primary/80">
        {m.auth_sign_up_policy_agreement_prefix()}
        <Link to="/policy/terms" search={{ referer: "/signup" }}>
          {m.auth_terms_link()}
        </Link>
        {m.auth_policy_agreement_and()}
        <Link to="/policy/privacy" search={{ referer: "/signup" }}>
          {m.auth_privacy_link()}
        </Link>
        .
      </div>
    </div>
  )
}
