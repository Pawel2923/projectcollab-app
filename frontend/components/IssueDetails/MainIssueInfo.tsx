import React from "react";

import type { ServerErrors } from "@/hooks/useServerValidation";
import type { IssueDetails } from "@/types/api/issue";

import { FormField } from "../ui/Form/FormField";
import { FormTextarea } from "../ui/Form/FormTextarea";
import { Input } from "../ui/input";

interface MainIssueInfoProps {
  issue: IssueDetails;
  serverErrors: ServerErrors;
}

export function MainIssueInfo({ issue, serverErrors }: MainIssueInfoProps) {
  return (
    <>
      <FormField
        name="title"
        label="Tytuł zadania"
        serverInvalid={serverErrors.title.isInvalid}
        serverMessage={serverErrors.title.message}
        valueMissingMessage="Tytuł zadania jest wymagany"
      >
        <Input id="title" name="title" defaultValue={issue.title} required />
      </FormField>

      <FormTextarea
        name="description"
        label="Opis zadania"
        serverInvalid={serverErrors.description.isInvalid}
        serverMessage={serverErrors.description.message}
        textareaProps={{
          defaultValue: issue.description,
          rows: 6,
          placeholder: "Dodaj szczegółowy opis zadania",
        }}
      />
    </>
  );
}
