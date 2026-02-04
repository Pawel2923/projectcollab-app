"use client";

import { Loader2Icon } from "lucide-react";
import { Form } from "radix-ui";
import React, { useActionState, useEffect, useRef, useState } from "react";

import createComment from "@/actions/createComment";
import { useServerValidation } from "@/hooks/useServerValidation";

import { TypographyInvalid } from "../../typography/TypographyInvalid";
import { Button } from "../../ui/button";
import { FormTextarea } from "../../ui/Form/FormTextarea";

const FORM_FIELDS = ["content"] as const;

interface AddIssueCommentFormProps {
  issueId: string;
  onCommentAdded?: () => void;
}

export function AddIssueCommentForm({
  issueId,
  onCommentAdded,
}: AddIssueCommentFormProps) {
  const [state, formAction, pending] = useActionState(createComment, null);
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
  );

  const [showButton, setShowButton] = useState(false);
  const lastSuccessfulStateRef = useRef<typeof state>(null);

  useEffect(() => {
    if (state?.ok && state !== lastSuccessfulStateRef.current) {
      lastSuccessfulStateRef.current = state;
      setShowButton(false);
      onCommentAdded?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const commentChangeHandler = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    const trimmedValue = ev.target.value.trim();

    if (trimmedValue.length > 0) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const resetHandler = () => {
    setShowButton(false);
    clearServerErrors();
  };

  const keyDownHandler = (ev: React.KeyboardEvent<HTMLFormElement>) => {
    if (ev.key === "Escape") {
      ev.currentTarget.reset();
    }

    if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) {
      ev.currentTarget.requestSubmit();
    }
  };

  return (
    <Form.Root
      className="grid gap-4"
      action={formAction}
      onSubmit={clearServerErrors}
      onReset={resetHandler}
      onKeyDown={keyDownHandler}
    >
      <input type="hidden" name="issueId" value={issueId} />
      <FormTextarea
        name="content"
        label=""
        serverInvalid={serverErrors.content.isInvalid}
        serverMessage={serverErrors.content.message}
        valueMissingMessage="Komentarz nie może być pusty"
        textareaProps={{
          placeholder: "Dodaj komentarz",
          onChange: commentChangeHandler,
          required: true,
        }}
      />

      {serverErrors.form?.isInvalid && (
        <TypographyInvalid>{serverErrors.form.message}</TypographyInvalid>
      )}

      {showButton && (
        <div className="justify-self-end flex gap-2">
          <Button type="reset" variant="outline">
            Anuluj
          </Button>
          <Form.Submit asChild>
            <Button
              type="submit"
              disabled={pending || serverErrors.form?.isInvalid}
            >
              Dodaj
              {pending && <Loader2Icon className="animate-spin ml-2" />}
            </Button>
          </Form.Submit>
        </div>
      )}
    </Form.Root>
  );
}
