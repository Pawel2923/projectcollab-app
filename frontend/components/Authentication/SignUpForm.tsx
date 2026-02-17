"use client";

import * as Form from "@radix-ui/react-form";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useActionState, useEffect } from "react";

import signUp from "@/actions/auth/signUp";
import { GoogleLogoIcon } from "@/assets/icons/GoogleLogoIcon";
import { MicrosoftLogoIcon } from "@/assets/icons/MicrosoftLogoIcon";
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

import { PasswordToggle } from "../PasswordToggle";
import { TypographyInvalid } from "../typography/TypographyInvalid";

const FORM_FIELDS = ["email", "password"] as const;

const SERVER_TO_FORM_FIELDS_MAP: Record<string, string> = {
  plainPassword: "password",
} as const;

export function SignUpForm({ className, ...props }: { className?: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signUp, null);
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
    SERVER_TO_FORM_FIELDS_MAP,
  );

  useEffect(() => {
    if (state?.ok && "content" in state) {
      sessionStorage.setItem(
        "auth_created_identity",
        state.content.email || "null",
      );
      router.push("/verify-email");
    }
  }, [router, state]);

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
          <CardTitle className="text-xl">Utwórz konto</CardTitle>
          <CardDescription>
            Zarejestruj się za pomocą konta Microsoft lub Google
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
                      callbackUrl: "/organizations",
                    })
                  }
                >
                  <MicrosoftLogoIcon size={21} />
                  Zarejestruj się z Microsoft
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2.5 p-3"
                  onClick={() =>
                    signIn("google", { callbackUrl: "/organizations" })
                  }
                  type="button"
                >
                  <GoogleLogoIcon size={21} />
                  Zarejestruj się z Google
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
                  label="Email"
                  type="email"
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
                    autoComplete="new-password"
                    required
                  />
                </FormField>
                {serverErrors.form?.isInvalid && (
                  <TypographyInvalid>
                    {serverErrors.form.message}
                  </TypographyInvalid>
                )}
                <Form.Submit asChild>
                  <Button type="submit" className="w-full" disabled={pending}>
                    Zarejestruj się
                    {pending && <Loader2Icon className="animate-spin" />}
                  </Button>
                </Form.Submit>
              </div>
              <div className="text-center text-sm">
                Masz już konto?{" "}
                <Link href="/signin" className="underline underline-offset-4">
                  Zaloguj się
                </Link>
              </div>
            </div>
          </Form.Root>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        Rejestrując się, akceptujesz nasze{" "}
        <a href="/policy/terms?referer=/signup">Warunki korzystania z usługi</a>{" "}
        oraz <a href="/policy/privacy?referer=/signup">Politykę prywatności</a>.
      </div>
    </div>
  );
}
