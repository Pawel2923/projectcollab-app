import * as React from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype"
import { useUserContext } from "../context/UserContext"
import { getPostLoginRedirect } from "../../domain/services/auth-navigation"
import { SignUpForm, type SignUpFormProps } from "./SignUpForm"
import { m } from "@/paraglide/messages"
import { BackButton } from "@/shared/ui"

export interface SignUpViewProps {
  redirectUrl?: string
  error?: string
  onOAuthSignIn?: SignUpFormProps["onOAuthSignIn"]
  onSuccess?: SignUpFormProps["onSuccess"]
}

export function SignUpView({
  redirectUrl,
  error,
  onOAuthSignIn,
  onSuccess,
}: SignUpViewProps) {
  const userContext = useUserContext()
  const navigate = useNavigate()
  const isSigningUpRef = React.useRef(false)

  const user = userContext?.user
  const isLoading = userContext?.isLoading

  React.useEffect(() => {
    if (!isLoading && user && !isSigningUpRef.current) {
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
        <SignUpForm
          redirectUrl={redirectUrl}
          error={error}
          onSignUpStart={() => {
            isSigningUpRef.current = true
          }}
          onSignUpError={() => {
            isSigningUpRef.current = false
          }}
          onOAuthSignIn={onOAuthSignIn}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  )
}
