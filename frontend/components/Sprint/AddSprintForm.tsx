"use client";

import * as Form from "@radix-ui/react-form";
import { Loader2Icon } from "lucide-react";
import React, { useActionState, useEffect } from "react";

import createSprint from "@/actions/sprint/createSprint";
import { TypographyInvalid } from "@/components/typography/TypographyInvalid";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/Form/FormInput";
import { FormTextarea } from "@/components/ui/Form/FormTextarea";
import { useServerValidation } from "@/hooks/useServerValidation";

const FORM_FIELDS = ["name", "goal", "startDate", "endDate"] as const;

interface AddSprintFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function AddSprintForm({ projectId, onSuccess }: AddSprintFormProps) {
  const [state, formAction, pending] = useActionState(createSprint, null);
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
  );

  useEffect(() => {
    if (state?.ok && onSuccess) {
      onSuccess();
    }
  }, [state, onSuccess]);

  // Get current datetime in YYYY-MM-DDTHH:MM format for min attribute
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <Form.Root action={formAction} onSubmit={clearServerErrors}>
      <input type="hidden" name="projectId" value={projectId} />
      <div className="grid gap-6">
        <FormInput
          name="name"
          label="Nazwa"
          serverInvalid={serverErrors.name.isInvalid}
          serverMessage={serverErrors.name.message}
          valueMissingMessage="Nazwa sprintu jest wymagana"
          inputProps={{ required: true }}
        />

        <FormTextarea
          name="goal"
          label="Cel sprintu"
          serverInvalid={serverErrors.goal.isInvalid}
          serverMessage={serverErrors.goal.message}
          textareaProps={{ id: "goal" }}
        />

        <FormInput
          name="startDate"
          type="datetime-local"
          label="Data i godzina rozpoczęcia"
          serverInvalid={serverErrors.startDate.isInvalid}
          serverMessage={serverErrors.startDate.message}
          valueMissingMessage="Data rozpoczęcia jest wymagana"
          inputProps={{
            min: minDateTime,
            required: true,
          }}
        />

        <FormInput
          name="endDate"
          type="datetime-local"
          label="Data i godzina zakończenia"
          serverInvalid={serverErrors.endDate.isInvalid}
          serverMessage={serverErrors.endDate.message}
          valueMissingMessage="Data zakończenia jest wymagana"
          inputProps={{
            min: minDateTime,
            required: true,
          }}
        />

        {serverErrors.form?.isInvalid && (
          <TypographyInvalid>{serverErrors.form.message}</TypographyInvalid>
        )}

        <Form.Submit asChild>
          <Button type="submit" className="w-full" disabled={pending}>
            Utwórz sprint
            {pending && <Loader2Icon className="animate-spin ml-2" />}
          </Button>
        </Form.Submit>
      </div>
    </Form.Root>
  );
}
