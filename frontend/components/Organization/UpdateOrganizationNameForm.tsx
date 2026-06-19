"use client";

import * as Form from "@radix-ui/react-form";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect } from "react";

import updateOrganizationName from "@/actions/organization/updateOrganizationName";
import { TypographyInvalid } from "@/components/typography/TypographyInvalid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormInput } from "@/components/ui/Form/FormInput";
import { useAlert } from "@/hooks/useAlert";
import { useServerValidation } from "@/hooks/useServerValidation";

interface UpdateOrganizationNameFormProps {
  organizationId: string;
  currentName: string;
  className?: string;
}

const FORM_FIELDS = ["name"] as const;

export function UpdateOrganizationNameForm({
  organizationId,
  currentName,
  className,
}: UpdateOrganizationNameFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateOrganizationName,
    null,
  );
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
  );
  const router = useRouter();
  const { notify } = useAlert();

  useEffect(() => {
    if (state?.ok) {
      notify({
        type: "default",
        title: "Nazwa zmieniona",
        description: "Pomyślnie zaktualizowano nazwę organizacji.",
        duration: 4000,
        hasCloseButton: true,
        icon: "check",
      });
      router.refresh();
    }
  }, [state, notify, router]);

  return (
    <Card className={className} key={currentName}>
      <CardHeader>
        <CardTitle className="text-xl">Zmień nazwę organizacji</CardTitle>
        <CardDescription>
          Zaktualizuj nazwę organizacji, aby zmienić jej wyświetlanie w systemie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form.Root action={formAction} onSubmit={clearServerErrors}>
          <input type="hidden" name="organizationId" value={organizationId} />

          <div className="grid gap-6">
            <FormInput
              name="name"
              label="Nowa nazwa organizacji"
              serverInvalid={serverErrors.name?.isInvalid || false}
              serverMessage={serverErrors.name?.message}
              valueMissingMessage="Nazwa organizacji jest wymagana"
              inputProps={{
                defaultValue: currentName,
                required: true,
                disabled: isPending,
                placeholder: "Wprowadź nową nazwę",
              }}
            />

            {serverErrors.form?.isInvalid && (
              <TypographyInvalid>{serverErrors.form.message}</TypographyInvalid>
            )}

            <Form.Submit asChild>
              <Button type="submit" disabled={isPending} className="w-fit">
                Zapisz zmiany
                {isPending && <Loader2Icon className="animate-spin ml-2" />}
              </Button>
            </Form.Submit>
          </div>
        </Form.Root>
      </CardContent>
    </Card>
  );
}
