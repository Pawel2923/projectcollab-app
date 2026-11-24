import { Link } from "@tanstack/react-router"
import { ProjectCollabLogotype } from "@/assets/img/ProjectCollabLogotype"
import { m } from "@/paraglide/messages"
import {
  BackButton,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui"
import {
  ResendVerifyEmailButton,
  type ResendVerifyEmailButtonProps,
} from "./ResendVerifyEmailButton"

export interface VerifyEmailViewProps {
  email?: string | null
  resendUseCaseInstance?: ResendVerifyEmailButtonProps["resendUseCaseInstance"]
  cooldownSeconds?: number
}

export function VerifyEmailView({
  email,
  resendUseCaseInstance,
  cooldownSeconds,
}: VerifyEmailViewProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <BackButton href="/signup" label={m.auth_verify_email_back_to_signup()} />
      <div className="flex w-full max-w-lg flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
          aria-label={m.landing_nav_logotype_aria_label()}
        >
          <ProjectCollabLogotype />
        </Link>
        <Card className="flex w-full flex-col gap-6">
          <CardHeader>
            <CardTitle className="text-xl">
              {m.auth_verify_email_title()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{m.auth_verify_email_description_check_inbox()}</p>
            <p>{m.auth_verify_email_description_check_spam()}</p>
          </CardContent>
          <CardFooter>
            <ResendVerifyEmailButton
              email={email}
              resendUseCaseInstance={resendUseCaseInstance}
              cooldownSeconds={cooldownSeconds}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
