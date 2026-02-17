"use client";

import * as Form from "@radix-ui/react-form";
import { Bug, ClipboardList, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useState } from "react";

import createIssue from "@/actions/issue/createIssue";
import { SubtaskIcon } from "@/assets/icons/SubtaskIcon";
import { TypographyInvalid } from "@/components/typography/TypographyInvalid";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/Form/FormInput";
import { FormSelect } from "@/components/ui/Form/FormSelect";
import { FormTextarea } from "@/components/ui/Form/FormTextarea";
import { Label } from "@/components/ui/label";
import { SelectGroup, SelectItem } from "@/components/ui/select";
import { useServerValidation } from "@/hooks/useServerValidation";

import { IssueSelector } from "./IssueSelector";

//TODO: improve this component

const FORM_FIELDS = [
  "title",
  "description",
  "priority",
  "statusId",
  "typeId",
] as const;

interface AddIssueFormProps {
  projectId: string;
  organizationId?: string;
  statuses?: { id: string; value: string }[];
  types?: { id: string; value: string }[];
  onSuccess?: () => void;
}

export function AddIssueForm({
  projectId,
  organizationId,
  statuses = [],
  types = [],
  onSuccess,
}: AddIssueFormProps) {
  const [state, formAction, pending] = useActionState(createIssue, null);
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
  );
  const router = useRouter();
  const [parentIssue, setParentIssue] = useState<string>("");
  const [relatedIssues, setRelatedIssues] = useState<string[]>([]);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      onSuccess?.();
    }
  }, [state, router, onSuccess]);

  return (
    <Form.Root action={formAction} onSubmit={clearServerErrors}>
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-6">
        <FormInput
          name="title"
          label="Tytuł*"
          serverInvalid={serverErrors.title.isInvalid}
          serverMessage={serverErrors.title.message}
          valueMissingMessage="Tytuł zadania jest wymagany"
          inputProps={{ required: true }}
        />

        <FormSelect
          name="typeId"
          label="Typ"
          serverInvalid={serverErrors.typeId.isInvalid}
          serverMessage={serverErrors.typeId.message}
          valueMissingMessage="Typ zadania jest wymagany"
          placeholder="Wybierz typ zadania"
          selectProps={{ name: "typeId", required: true }}
        >
          <SelectGroup>
            {types.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                <div className="flex items-center gap-2">
                  {type.value === "TASK" && <ClipboardList />}
                  {type.value === "SUBTASK" && <SubtaskIcon />}
                  {type.value === "BUG" && <Bug />}
                  {type.value}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </FormSelect>

        <FormSelect
          name="statusId"
          label="Status"
          serverInvalid={serverErrors.statusId.isInvalid}
          serverMessage={serverErrors.statusId.message}
          valueMissingMessage="Status jest wymagany"
          placeholder="Wybierz status"
          selectProps={{ name: "statusId", required: true }}
        >
          <SelectGroup>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.value}
              </SelectItem>
            ))}
          </SelectGroup>
        </FormSelect>

        <FormSelect
          name="priority"
          label="Priorytet"
          serverInvalid={serverErrors.priority.isInvalid}
          serverMessage={serverErrors.priority.message}
          valueMissingMessage="Priorytet jest wymagany"
          placeholder="Wybierz priorytet"
          selectProps={{ name: "priority", required: true }}
        >
          <SelectGroup>
            <SelectItem value="low">Niski</SelectItem>
            <SelectItem value="medium">Średni</SelectItem>
            <SelectItem value="high">Wysoki</SelectItem>
            <SelectItem value="critical">Krytyczny</SelectItem>
          </SelectGroup>
        </FormSelect>

        <FormTextarea
          name="description"
          label="Opis"
          serverInvalid={serverErrors.description.isInvalid}
          serverMessage={serverErrors.description.message}
          textareaProps={{ id: "description" }}
        />

        <div className="grid gap-2">
          <Label htmlFor="parentIssue">Zadanie nadrzędne</Label>
          <IssueSelector
            name="parentIssue"
            organizationId={organizationId}
            projectId={projectId}
            value={parentIssue}
            onChange={(value) => setParentIssue(value as string)}
            placeholder="Wybierz zadanie nadrzędne"
          />
          <input type="hidden" name="parentIssue" value={parentIssue} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="relatedIssues">Powiązane zadania</Label>
          <IssueSelector
            name="relatedIssues"
            organizationId={organizationId}
            projectId={projectId}
            value={relatedIssues}
            onChange={(value) => setRelatedIssues(value as string[])}
            multiple
            placeholder="Wybierz powiązane zadania"
          />
          {relatedIssues.map((issue, index) => (
            <input
              key={index}
              type="hidden"
              name="relatedIssues"
              value={issue}
            />
          ))}
        </div>

        {serverErrors.form?.isInvalid && (
          <TypographyInvalid>{serverErrors.form.message}</TypographyInvalid>
        )}

        <Form.Submit asChild>
          <Button type="submit" className="w-full" disabled={pending}>
            Utwórz zadanie
            {pending && <Loader2Icon className="animate-spin ml-2" />}
          </Button>
        </Form.Submit>
      </div>
    </Form.Root>
  );
}
