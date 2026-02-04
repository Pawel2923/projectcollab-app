"use client";

import { Loader2Icon } from "lucide-react";
import { Form } from "radix-ui";
import React, { useActionState, useEffect, useRef } from "react";

import updateComment from "@/actions/updateComment";
import { useServerValidation } from "@/hooks/useServerValidation";
import type { Comment } from "@/lib/types/api";

import { TypographyInvalid } from "../../typography/TypographyInvalid";
import { Button } from "../../ui/button";
import { FormTextarea } from "../../ui/Form/FormTextarea";

const FORM_FIELDS = ["content"] as const;

interface CommentEditFormProps {
  comment: Comment;
  setIsEditing: (isEditing: boolean) => void;
  onCommentUpdated?: () => void;
}

export function CommentEditForm({
  comment,
  setIsEditing,
  onCommentUpdated,
}: CommentEditFormProps) {
  const [state, formAction, pending] = useActionState(updateComment, null);
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSuccessfulStateRef = useRef<typeof state>(null);

  useEffect(() => {
    if (state?.ok && state !== lastSuccessfulStateRef.current) {
      lastSuccessfulStateRef.current = state;
      setIsEditing?.(false);
      onCommentUpdated?.();
    }

    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsEditing, state]);

  const resetHandler = () => {
    setIsEditing?.(false);
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
      onReset={resetHandler}
      onKeyDown={keyDownHandler}
    >
      <input
        type="hidden"
        name="commentIri"
        value={comment["@id"]}
        aria-hidden="true"
      />

      <FormTextarea
        name="content"
        label=""
        serverInvalid={serverErrors.content.isInvalid}
        serverMessage={serverErrors.content.message}
        valueMissingMessage="Komentarz nie może być pusty"
        textareaProps={{
          placeholder: "Edytuj komentarz",
          required: true,
          defaultValue: comment.content,
          ref: textareaRef,
        }}
      />

      {serverErrors.form?.isInvalid && (
        <TypographyInvalid>{serverErrors.form.message}</TypographyInvalid>
      )}

      <div className="justify-self-end flex gap-2">
        <Button type="reset" variant="outline">
          Anuluj
        </Button>
        <Form.Submit asChild>
          <Button
            type="submit"
            disabled={pending || serverErrors.form?.isInvalid}
          >
            Zapisz
            {pending && <Loader2Icon className="animate-spin ml-2" />}
          </Button>
        </Form.Submit>
      </div>
    </Form.Root>
  );
}
