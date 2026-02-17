"use client";

import * as Form from "@radix-ui/react-form";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useActionState } from "react";

import login from "@/actions/auth/login";
import { GoogleLogoIcon } from "@/assets/icons/GoogleLogoIcon";
import { MicrosoftLogoIcon } from "@/assets/icons/MicrosoftLogoIcon";
import { PasswordToggle } from "@/components/PasswordToggle";
import { TypographyInvalid } from "@/components/typography/TypographyInvalid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField, FormFieldLabel } from "@/components/ui/Form/FormField";
import { FormInput } from "@/components/ui/Form/FormInput";
import { useServerValidation } from "@/hooks/useServerValidation";
import { classNamesMerger } from "@/utils/class-names-merger";

const FORM_FIELDS = ["email", "password"] as const;

const SERVER_TO_FORM_FIELDS_MAP: Record<string, string> = {
  plainPassword: "password",
} as const;

export function SignInForm({
  className,
  redirectUrl,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  redirectUrl?: string;
}) {
  const [state, formAction, pending] = useActionState(login, null);
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
    SERVER_TO_FORM_FIELDS_MAP,
  );

  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage =
    error === "Configuration"
      ? "Błąd konfiguracji logowania."
      : error === "AccessDenied"
        ? "Dostęp zabroniony."
        : error
          ? "Wystąpił błąd logowania."
          : null;

  return (
    <div
      className={classNamesMerger("flex flex-col gap-6", className)}
      {...props}
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Witaj ponownie</CardTitle>
          <CardDescription>
            Zaloguj się za pomocą konta Microsoft lub Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form.Root
            action={formAction}
            onSubmit={clearServerErrors}
            onClearServerErrors={clearServerErrors}
          >
            <div className="grid gap-6">
              {errorMessage && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
                  {errorMessage}
                </div>
              )}
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full gap-3 p-3"
                  type="button"
                  onClick={() =>
                    signIn("microsoft-entra-id", {
                      redirectTo: redirectUrl || "/organizations",
                    })
                  }
                >
                  <MicrosoftLogoIcon size={21} />
                  Zaloguj się z Microsoft
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2.5 p-3"
                  type="button"
                  onClick={() =>
                    signIn("google", {
                      redirectTo: redirectUrl || "/organizations",
                    })
                  }
                >
                  <GoogleLogoIcon size={21} />
                  Zaloguj się z Google
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Lub kontynuuj z
                </span>
              </div>
              <div className="grid gap-6">
                <FormInput
                  name="email"
                  type="email"
                  label="Email"
                  serverInvalid={serverErrors.email.isInvalid}
                  serverMessage={serverErrors.email.message}
                  valueMissingMessage="Email jest wymagany"
                  inputProps={{
                    autoComplete: "email",
                    required: true,
                  }}
                />
                <FormField
                  name="password"
                  label="Hasło"
                  serverInvalid={serverErrors.password.isInvalid}
                  serverMessage={serverErrors.password.message}
                  valueMissingMessage="Hasło jest wymagane"
                  asChild
                >
                  <FormFieldLabel name="password" label="Hasło" id="password" />
                  <PasswordToggle
                    name="password"
                    autoComplete="current-password"
                    required
                  />
                </FormField>

                <Link
                  href="/reset-password"
                  className="underline underline-offset-4 text-sm"
                >
                  Zapomniałeś hasła?
                </Link>
                {serverErrors.form?.isInvalid && (
                  <TypographyInvalid>
                    {serverErrors.form.message}
                  </TypographyInvalid>
                )}
                <Form.Submit asChild>
                  <Button type="submit" className="w-full" disabled={pending}>
                    Zaloguj się
                    {pending && <Loader2Icon className="animate-spin" />}
                  </Button>
                </Form.Submit>
              </div>
              <div className="text-center text-sm">
                Nie masz konta?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  Zarejestruj się
                </Link>
              </div>
            </div>

            <input type="hidden" name="redirectUrl" value={redirectUrl} />
          </Form.Root>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        Logując się, akceptujesz nasze{" "}
        <a href="/policy/terms?referer=/signin">Warunki korzystania z usługi</a>{" "}
        oraz <a href="/policy/privacy?referer=/signin">Politykę prywatności</a>.
      </div>
    </div>
  );
}
