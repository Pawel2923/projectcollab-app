import { Link } from "@tanstack/react-router"
import { Mail, MailCheck } from "lucide-react"
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
import { readCreatedIdentityEmail } from "../../infrastructure/storage/created-identity.storage"
import { useUserContext } from "../context/UserContext"
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
  const userContext = useUserContext()
  const user = userContext?.user
  const isLoading = userContext?.isLoading

  const isAlreadyVerified = !isLoading && user?.isVerified === true
  const resolvedEmail =
    email?.trim() || readCreatedIdentityEmail() || user?.email?.trim() || null

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <BackButton href="/signup" label={m.auth_verify_email_back_to_signup()} />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
          aria-label={m.landing_nav_logotype_aria_label()}
        >
          <ProjectCollabLogotype />
        </Link>

        {isAlreadyVerified ? (
          <Card className="w-full">
            <CardHeader className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <MailCheck className="size-8" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">
                <h1>{m.auth_verify_email_already_verified_title()}</h1>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>{m.auth_verify_email_already_verified_description()}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2">
              <Button className="w-full" render={<Link to="/organizations" />}>
                {m.auth_verify_email_confirm_go_to_app()}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full">
            <CardHeader className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Mail className="size-8" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">
                <h1>{m.auth_verify_email_title()}</h1>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-center text-sm text-muted-foreground">
              {resolvedEmail && (
                <p className="font-medium break-words text-foreground">
                  {m.auth_verify_email_sent_to({ email: resolvedEmail })}
                </p>
              )}
              <p>{m.auth_verify_email_description_check_inbox()}</p>
              <p>{m.auth_verify_email_description_check_spam()}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
              <ResendVerifyEmailButton
                email={email}
                resendUseCaseInstance={resendUseCaseInstance}
                cooldownSeconds={cooldownSeconds}
              />
              {!user && (
                <div className="text-center text-sm text-muted-foreground">
                  {m.auth_verify_email_already_verified_prompt()}{" "}
                  <Link
                    to="/signin"
                    className="font-medium text-dark-primary underline underline-offset-4 transition-colors hover:text-primary hover:opacity-85 dark:text-primary dark:hover:text-primary/80"
                  >
                    {m.auth_sign_in_link()}
                  </Link>
                </div>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
