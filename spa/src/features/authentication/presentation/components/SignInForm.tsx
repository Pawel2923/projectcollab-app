import * as React from "react"
import { useForm } from "react-hook-form"
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
import { ApiError } from "@/shared/api"
import { InvalidCredentialsError } from "../../domain/errors/auth-error"
import { getPostLoginRedirect } from "../../domain/services/auth-navigation"
import {
  LoginUseCase,
  loginUseCase as defaultLoginUseCase,
} from "../../application/use-cases/login.use-case"
import {
  signInSchema,
  type SignInFormData,
} from "../../application/validation/sign-in.schema"
import { PasswordToggle } from "./PasswordToggle"

export interface SignInFormProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  redirectUrl?: string
  error?: string
  loginUseCaseInstance?: LoginUseCase
  onSuccess?: (targetUrl: string) => void
  onOAuthSignIn?: (provider: "microsoft-entra-id" | "google") => void
}

function resolveErrorMessage(error?: string): string | null {
  if (!error) return null
  if (error === "Configuration") return m.auth_configuration_error()
  if (error === "AccessDenied") return m.auth_access_denied_error()
  return m.auth_general_error()
}

export function SignInForm({
  className,
  redirectUrl,
  error,
  loginUseCaseInstance = defaultLoginUseCase,
  onSuccess,
  onOAuthSignIn,
  ...props
}: SignInFormProps) {
  const navigate = useNavigate()
  const searchErrorMessage = resolveErrorMessage(error)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  })

  const onSubmit = async (data: SignInFormData) => {
    clearErrors("root")
    try {
      await loginUseCaseInstance.execute(data)
      const target = getPostLoginRedirect(redirectUrl)
      if (onSuccess) {
        onSuccess(target)
      } else {
        await navigate({ to: target })
      }
    } catch (err: unknown) {
      if (err instanceof InvalidCredentialsError) {
        setError("root", { message: m.auth_invalid_credentials() })
      } else if (err instanceof ApiError && err.status === 401) {
        setError("root", { message: m.auth_invalid_credentials() })
      } else {
        setError("root", { message: m.auth_general_error() })
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {m.auth_sign_in_welcome_back()}
          </CardTitle>
          <CardDescription>{m.auth_sign_in_subtitle()}</CardDescription>
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
                  {m.auth_sign_in_with_microsoft()}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2.5 p-3"
                  type="button"
                  onClick={() => onOAuthSignIn?.("google")}
                >
                  <GoogleLogoIcon size={21} />
                  {m.auth_sign_in_with_google()}
                </Button>
              </div>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  {m.auth_sign_in_or_continue_with()}
                </span>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="signin-email">{m.auth_field_email()}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="user@example.com"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "signin-email-error" : undefined
                    }
                    {...register("email")}
                  />
                  {errors.email?.message && (
                    <span
                      id="signin-email-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="signin-password">
                    {m.auth_field_password()}
                  </Label>
                  <PasswordToggle
                    id="signin-password"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "signin-password-error" : undefined
                    }
                    {...register("password")}
                  />
                  {errors.password?.message && (
                    <span
                      id="signin-password-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.password.message}
                    </span>
                  )}
                  <div>
                    <a
                      href="/reset-password"
                      className="text-sm font-medium text-dark-primary underline underline-offset-4 transition-colors hover:text-primary hover:opacity-85 dark:text-primary dark:hover:text-primary/80"
                    >
                      {m.auth_forgot_password()}
                    </a>
                  </div>
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
                  {m.auth_sign_in_button()}
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {m.auth_no_account()}{" "}
                <Link
                  to="/signup"
                  className="font-medium text-dark-primary underline underline-offset-4 transition-colors hover:text-primary hover:opacity-85 dark:text-primary dark:hover:text-primary/80"
                >
                  {m.auth_sign_up_link()}
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-balance text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:hover:text-primary [&_a]:hover:opacity-85 dark:[&_a]:hover:text-primary/80">
        {m.auth_policy_agreement_prefix()}
        <Link to="/policy/terms" search={{ referer: "/signin" }}>
          {m.auth_terms_link()}
        </Link>
        {m.auth_policy_agreement_and()}
        <Link to="/policy/privacy" search={{ referer: "/signin" }}>
          {m.auth_privacy_link()}
        </Link>
        .
      </div>
    </div>
  )
}
