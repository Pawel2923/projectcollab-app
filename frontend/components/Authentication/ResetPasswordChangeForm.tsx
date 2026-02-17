"use client";

import * as Form from "@radix-ui/react-form";
import { CircleCheck, Loader2Icon, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useActionState, useEffect } from "react";

import resetUserPassword from "@/actions/auth/resetUserPassword";
import { TypographyInvalid } from "@/components/typography/TypographyInvalid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/hooks/useAlert";
import { useServerValidation } from "@/hooks/useServerValidation";
import { mapMessage } from "@/services/message-mapper/message-mapper";
import { sanitizeInput } from "@/utils/input-sanitizer";

const FORM_FIELDS = ["password", "repeatPassword"] as const;

const SERVER_TO_FORM_FIELDS_MAP: Record<string, string> = {
  plainPassword: "password",
} as const;

export function ResetPasswordChangeForm() {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(resetUserPassword, null);
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
    SERVER_TO_FORM_FIELDS_MAP,
  );
  const router = useRouter();
  const { notify } = useAlert();

  const token = sanitizeInput(searchParams.get("token") ?? "");

  useEffect(() => {
    if (state?.ok) {
      const { title, description } = mapMessage("RESET_PASSWORD_SUCCESS");

      notify({
        title,
        description,
        type: "default",
        icon: <CircleCheck />,
        duration: 5000,
        hasCloseButton: true,
      });

      router.push("/signin");
    } else if (!state?.ok && state?.code) {
      let title = "INTERNAL_SERVER_ERROR";
      let description: string | undefined;
      if (state.code) {
        const mappedMessage = mapMessage(state?.code);
        title = mappedMessage.title;
        description = mappedMessage.description;
      }

      notify({
        title,
        description,
        type: "destructive",
        icon: <XCircle />,
        duration: 5000,
        hasCloseButton: true,
      });
    }
  }, [notify, router, state]);

  return (
    <Form.Root
      action={formAction}
      onSubmit={clearServerErrors}
      onClearServerErrors={clearServerErrors}
    >
      <div className={"grid gap-6"}>
        <Form.Field
          name={"password"}
          className="grid gap-2"
          serverInvalid={serverErrors.password.isInvalid}
        >
          <Form.Label asChild>
            <Label htmlFor="password">Nowe hasło</Label>
          </Form.Label>
          <Form.Control asChild>
            <Input
              type="password"
              id={"password"}
              autoComplete="new-password"
              required
            />
          </Form.Control>
          <Form.Message match="valueMissing" asChild>
            <TypographyInvalid>To pole jest wymagane</TypographyInvalid>
          </Form.Message>
          {serverErrors.password.isInvalid && (
            <Form.Message asChild>
              <TypographyInvalid>
                {serverErrors.password.message}
              </TypographyInvalid>
            </Form.Message>
          )}
        </Form.Field>
        <Form.Field
          name={"repeatPassword"}
          className="grid gap-2"
          serverInvalid={serverErrors.repeatPassword.isInvalid}
        >
          <Form.Label asChild>
            <Label htmlFor="repeatPassword">Powtórz hasło</Label>
          </Form.Label>
          <Form.Control asChild>
            <Input
              type="password"
              id={"repeatPassword"}
              autoComplete="new-password"
              required
            />
          </Form.Control>
          <Form.Message match="valueMissing" asChild>
            <TypographyInvalid>To pole jest wymagane</TypographyInvalid>
          </Form.Message>
          <Form.Message
            match={(value, formData) => value !== formData.get("password")}
            asChild
          >
            <TypographyInvalid>Hasła nie są zgodne</TypographyInvalid>
          </Form.Message>
          {serverErrors.repeatPassword.isInvalid && (
            <Form.Message asChild>
              <TypographyInvalid>
                {serverErrors.repeatPassword.message}
              </TypographyInvalid>
            </Form.Message>
          )}
        </Form.Field>
        <Form.Field name="token" className="hidden">
          <Form.Control type="hidden" id="token" value={token} />
        </Form.Field>
        {serverErrors.form?.isInvalid && (
          <TypographyInvalid>{serverErrors.form.message}</TypographyInvalid>
        )}
        <Form.Submit asChild>
          <Button type="submit" disabled={pending}>
            Zresetuj hasło
            {pending && <Loader2Icon className="animate-spin" />}
          </Button>
        </Form.Submit>
      </div>
    </Form.Root>
  );
}
