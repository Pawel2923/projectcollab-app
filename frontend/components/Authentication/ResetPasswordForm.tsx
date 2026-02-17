"use client";

import * as Form from "@radix-ui/react-form";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect } from "react";

import sendResetPasswordRequest from "@/actions/auth/sendResetPasswordRequest";
import { TypographyInvalid } from "@/components/typography/TypographyInvalid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerValidation } from "@/hooks/useServerValidation";

const FORM_FIELDS = ["email"] as const;

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    sendResetPasswordRequest,
    null,
  );
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.isRequestProcessed) {
      router.push("/reset-password/sent");
    }
  }, [state, router]);

  return (
    <Form.Root
      action={formAction}
      onSubmit={clearServerErrors}
      onClearServerErrors={clearServerErrors}
    >
      <div className={"grid gap-6"}>
        <Form.Field
          name={"email"}
          className="grid gap-2"
          serverInvalid={serverErrors.email.isInvalid}
        >
          <Form.Label asChild>
            <Label htmlFor="email">Adres email Twojego konta</Label>
          </Form.Label>
          <Form.Control asChild>
            <Input type="email" id={"email"} autoComplete="email" required />
          </Form.Control>
          <Form.Message match="valueMissing" asChild>
            <TypographyInvalid>Email jest wymagany</TypographyInvalid>
          </Form.Message>
          <Form.Message match="typeMismatch" asChild>
            <TypographyInvalid>
              Proszę podać prawidłowy adres email
            </TypographyInvalid>
          </Form.Message>
          {serverErrors.email.isInvalid && (
            <Form.Message asChild>
              <TypographyInvalid>
                {serverErrors.email.message}
              </TypographyInvalid>
            </Form.Message>
          )}
        </Form.Field>
        <Form.Submit asChild>
          <Button type="submit" disabled={pending}>
            Wyślij
            {pending && <Loader2Icon className="animate-spin" />}
          </Button>
        </Form.Submit>
      </div>
    </Form.Root>
  );
}
