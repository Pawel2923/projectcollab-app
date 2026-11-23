import * as React from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype"
import { useUserContext } from "../context/UserContext"
import { getPostLoginRedirect } from "../../domain/services/auth-navigation"
import { SignInForm, type SignInFormProps } from "./SignInForm"
import { m } from "@/paraglide/messages"
import { BackButton } from "@/shared/ui"

export interface SignInViewProps {
  redirectUrl?: string
  error?: string
  onOAuthSignIn?: SignInFormProps["onOAuthSignIn"]
  onSuccess?: SignInFormProps["onSuccess"]
}

export function SignInView({
  redirectUrl,
  error,
  onOAuthSignIn,
  onSuccess,
}: SignInViewProps) {
  const userContext = useUserContext()
  const navigate = useNavigate()

  const user = userContext?.user
  const isLoading = userContext?.isLoading

  React.useEffect(() => {
    if (!isLoading && user) {
      const target = getPostLoginRedirect(redirectUrl)
      navigate({ to: target })
    }
  }, [isLoading, user, redirectUrl, navigate])

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
        <SignInForm
          redirectUrl={redirectUrl}
          error={error}
          onOAuthSignIn={onOAuthSignIn}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  )
}
