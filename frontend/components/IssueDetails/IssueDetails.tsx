"use client";

import * as Form from "@radix-ui/react-form";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useMemo, useState } from "react";

import updateIssue from "@/actions/updateIssue";
import { AssigneeAvatar } from "@/components/AssigneeAvatar";
import { IssueSoftDeleteContainer } from "@/components/IssueDetails/SoftDelete/IssueSoftDeleteContainer";
import { TypographyInvalid } from "@/components/typography/TypographyInvalid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectGroup, SelectItem } from "@/components/ui/select";
import { AppError } from "@/error/app-error";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import { useServerValidation } from "@/hooks/useServerValidation";
import { apiGet } from "@/lib/utils/apiClient";
import { getDefaultMessage } from "@/lib/utils/errorHandler";
import { buildResourceIri, extractIdFromIri } from "@/lib/utils/iri";
import {
  formatEstimatedTime,
  isValidTimeString,
} from "@/services/issue/issue-date-time-service";
import type { Collection } from "@/types/api/collection";
import type { IssueDetails as IssueDetailsType } from "@/types/api/issue";
import type { IssueComment } from "@/types/api/issue-metadata";
import type { ProjectMember } from "@/types/api/project";
import type { Sprint } from "@/types/api/sprint";
import type { User } from "@/types/api/user";

import { IssuePriority } from "../Issue/IssuePriority";
import { ComboBox } from "../ui/combobox";
import { FormField, FormFieldLabel } from "../ui/Form/FormField";
import { FormInput } from "../ui/Form/FormInput";
import { FormSelect } from "../ui/Form/FormSelect";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Comments } from "./Comment/Comments";
import { IssueAttachments } from "./IssueAttachments";
import { IssueMetadata } from "./IssueMetadata";
import { IssueProgress } from "./IssueProgress";
import { IssueRelations } from "./IssueRelations";
import { IssueSprints } from "./IssueSprints";
import { MainIssueInfo } from "./MainIssueInfo";
import { IssueTags } from "./Tag/IssueTags";
import type { SelectOption } from "./types";

type IssueDetailsProps = {
  organizationId: string;
  projectId: string;
  issue: IssueDetailsType;
  statusOptions: SelectOption[];
  typeOptions: SelectOption[];
  resolutionOptions: SelectOption[];
  comments?: Collection<IssueComment>;
  projectMembers?: ProjectMember[];
  sprints?: Sprint[];
};

const FORM_FIELDS = [
  "title",
  "description",
  "priority",
  "statusId",
  "typeId",
  "resolutionId",
  "startDate",
  "endDate",
  "estimated",
  "loggedTime",
  "assignees",
] as const;

const SERVER_TO_FORM_FIELDS_MAP: Record<string, string> = {
  status: "statusId",
  type: "typeId",
  resolution: "resolutionId",
} as const;

const NO_RESOLUTION_VALUE = "__none__" as const;

export function IssueDetails({
  organizationId,
  projectId,
  issue,
  statusOptions,
  typeOptions,
  resolutionOptions,
  comments,
  projectMembers,
  sprints = [],
}: IssueDetailsProps) {
  const [state, formAction, pending] = useActionState(updateIssue, null);
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
    SERVER_TO_FORM_FIELDS_MAP,
  );
  const { showError, showSuccess } = useErrorHandler();
  const router = useRouter();

  useMercureObserver<IssueDetailsType>({
    topics: [`/projects/${projectId}/issues`],
    onUpdate: (updatedIssue) => {
      if (updatedIssue["@id"] === issue["@id"]) {
        router.refresh();
      }
    },
  });

  useMercureObserver<Sprint>({
    topics: [`/sprints?project=${projectId}`],
    onUpdate: () => {
      router.refresh();
    },
  });

  const [clientErrors, setClientErrors] = useState<{
    estimated?: string;
    loggedTime?: string;
  }>({});

  function validateTimeValue(
    field: "estimated" | "loggedTime",
    value?: string | null,
  ) {
    const trimmed = (value || "").trim();
    if (trimmed === "") {
      return "";
    }

    // allow numeric minutes (e.g. '90') or formatted strings like '3h 30m'
    if (/^\d+$/.test(trimmed) || isValidTimeString(trimmed)) {
      return "";
    }

    if (field === "loggedTime") {
      return 'Nieprawidłowy format zarejestrowanego czasu. Użyj: 1w 2d 3h 4m (np. "3h 30m").';
    }

    return 'Nieprawidłowy format czasu. Użyj: 1w 2d 3h 4m (np. "3h 30m").';
  }

  const [assignedUsers, setAssignedUsers] = useState<SelectOption[]>(
    issue.assignees.map((assignee) => ({
      value: assignee.id,
      label: assignee.username || assignee.email,
      id: assignee.id?.toString() || "",
      iri:
        assignee["@id"] ||
        buildResourceIri("users", assignee.id?.toString() || "") ||
        "",
    })),
  );

  async function handleAssigneesChange(iri: string) {
    const user = await apiGet<User>(iri);

    setAssignedUsers((prev) => {
      const existingUser = prev.find((user) => user.iri === iri);
      if (existingUser) {
        return prev.filter((user) => user.iri !== iri);
      }

      return [
        ...prev,
        {
          value: iri,
          label: user.data?.username || user.data?.email || "",
          id: user.data?.id?.toString() || "",
          iri,
        },
      ];
    });
  }

  function handleFieldBlur(
    field: "estimated" | "loggedTime",
    value?: string | null,
  ) {
    const msg = validateTimeValue(field, value);
    setClientErrors((prev) => ({ ...prev, [field]: msg || undefined }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const est =
      typeof fd.get("estimated") === "string"
        ? (fd.get("estimated") as string)
        : "";
    const log =
      typeof fd.get("loggedTime") === "string"
        ? (fd.get("loggedTime") as string)
        : "";

    const estMsg = validateTimeValue("estimated", est);
    const logMsg = validateTimeValue("loggedTime", log);

    if (estMsg || logMsg) {
      e.preventDefault();
      setClientErrors({
        estimated: estMsg || undefined,
        loggedTime: logMsg || undefined,
      });
      return;
    }

    // Clear previous server errors and client errors on successful client-side validation
    clearServerErrors();
    setClientErrors({});
  }

  useEffect(() => {
    if (state?.ok) {
      showSuccess("Zadanie zostało zaktualizowane");
      router.refresh();
    } else if (state?.message && state?.code !== "VALIDATION_ERROR") {
      console.log("Error state:", state);
      const message = state.message || getDefaultMessage(state.code);
      showError(
        new AppError({
          message,
          code: state.code,
          status: state.status,
          violations: state.violations,
        }),
      );
    }
  }, [router, showError, showSuccess, state]);

  const statusLabel = useMemo(() => {
    const statusIri =
      typeof issue.status === "string" ? issue.status : issue.status["@id"];
    const statusId = extractIdFromIri(statusIri);
    return statusOptions.find((option) => option.id === statusId)?.label;
  }, [issue.status, statusOptions]);

  const typeLabel = useMemo(() => {
    const typeIri =
      typeof issue.type === "string" ? issue.type : issue.type["@id"];
    const typeId = extractIdFromIri(typeIri);
    return typeOptions.find((option) => option.id === typeId)?.label;
  }, [issue.type, typeOptions]);

  const resolutionIri = issue.resolution
    ? typeof issue.resolution === "string"
      ? issue.resolution
      : issue.resolution["@id"]
    : undefined;
  const resolutionId = extractIdFromIri(resolutionIri);
  const resolutionDefaultValue = resolutionId ?? NO_RESOLUTION_VALUE;

  const statusIri =
    typeof issue.status === "string" ? issue.status : issue.status["@id"];
  const statusId = extractIdFromIri(statusIri) ?? "";

  const typeIri =
    typeof issue.type === "string" ? issue.type : issue.type["@id"];
  const typeId = extractIdFromIri(typeIri) ?? "";

  console.log(issue);

  return (
    <>
      <Form.Root
        action={formAction}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <input type="hidden" name="issueId" value={issue.id} />

        <div className="grid gap-6 grid-cols-1">
          <Card className="gap-0">
            <CardHeader className="gap-3 border-b">
              <h1 className="flex flex-wrap items-baseline gap-2 text-3xl font-bold tracking-tight">
                <span className="text-muted-foreground font-normal text-xl">
                  {issue.key}
                </span>
                <span className="text-foreground">{issue.title}</span>
              </h1>
              <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="rounded-full bg-accent px-3 py-1 text-xs uppercase tracking-wide text-accent-foreground">
                      {typeLabel || "Typ nieznany"}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Typ zadania</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {statusLabel || "Status nieznany"}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Status zadania</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {issue.priority && (
                      <IssuePriority
                        priority={issue.priority}
                        showIcon={false}
                        asBlock={true}
                      />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>Priorytet zadania</TooltipContent>
                </Tooltip>
                <IssueMetadata issue={issue} />
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid xl:grid-cols-[2fr_1fr] gap-8">
              <div className="space-y-4">
                <MainIssueInfo issue={issue} serverErrors={serverErrors} />
                <IssueRelations
                  organizationId={organizationId}
                  projectId={projectId}
                  issue={issue}
                />
                <IssueAttachments issue={issue} />
              </div>
              <div className="space-y-4">
                <FormSelect
                  name="statusId"
                  label="Status"
                  serverInvalid={serverErrors.statusId.isInvalid}
                  serverMessage={serverErrors.statusId.message}
                  valueMissingMessage="Status jest wymagany"
                  placeholder="Wybierz status"
                  selectProps={{ defaultValue: statusId, required: true }}
                >
                  <SelectGroup>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </FormSelect>

                <FormSelect
                  name="typeId"
                  label="Typ zadania"
                  serverInvalid={serverErrors.typeId.isInvalid}
                  serverMessage={serverErrors.typeId.message}
                  valueMissingMessage="Typ jest wymagany"
                  placeholder="Wybierz typ"
                  selectProps={{ defaultValue: typeId, required: true }}
                >
                  <SelectGroup>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
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
                  selectProps={{
                    defaultValue: issue.priority ?? "medium",
                    required: true,
                  }}
                >
                  <SelectGroup>
                    <SelectItem value="low">Niski</SelectItem>
                    <SelectItem value="medium">Średni</SelectItem>
                    <SelectItem value="high">Wysoki</SelectItem>
                    <SelectItem value="critical">Krytyczny</SelectItem>
                  </SelectGroup>
                </FormSelect>

                <FormSelect
                  name="resolutionId"
                  label="Rozwiązanie"
                  serverInvalid={serverErrors.resolutionId.isInvalid}
                  serverMessage={serverErrors.resolutionId.message}
                  placeholder="Wybierz rozwiązanie"
                  selectProps={{ defaultValue: resolutionDefaultValue }}
                >
                  <SelectGroup>
                    <SelectItem value={NO_RESOLUTION_VALUE}>Brak</SelectItem>
                    {resolutionOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </FormSelect>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    name="startDate"
                    label="Data rozpoczęcia"
                    type="date"
                    inputProps={{
                      defaultValue: toDateInputValue(issue.startDate),
                    }}
                    serverInvalid={serverErrors.startDate.isInvalid}
                    serverMessage={serverErrors.startDate.message}
                  />

                  <FormInput
                    name="endDate"
                    label="Termin"
                    type="date"
                    inputProps={{
                      defaultValue: toDateInputValue(issue.endDate),
                    }}
                    serverInvalid={serverErrors.endDate.isInvalid}
                    serverMessage={serverErrors.endDate.message}
                  />
                </div>

                <div className="grid gap-4">
                  <IssueProgress issue={issue} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      name="estimated"
                      label="Szacowany czas"
                      serverInvalid={serverErrors.estimated.isInvalid}
                      asChild
                    >
                      <FormFieldLabel
                        name="estimated"
                        label="Szacowany czas (w, d, h, m)"
                        tooltipContent="Użyj formatu: 1w 2d 3h 4m (tydzień, dzień, godzina, minuta)"
                      />
                      <Input
                        id="estimated"
                        name="estimated"
                        type="text"
                        defaultValue={formatEstimatedTime(issue.estimated ?? 0)}
                        onBlur={(e) =>
                          handleFieldBlur("estimated", e.currentTarget.value)
                        }
                      />
                      {clientErrors.estimated && (
                        <Form.Message asChild>
                          <TypographyInvalid>
                            {clientErrors.estimated}
                          </TypographyInvalid>
                        </Form.Message>
                      )}
                    </FormField>

                    <FormField
                      name="loggedTime"
                      label="Zarejestrowany czas"
                      serverInvalid={serverErrors.loggedTime.isInvalid}
                      asChild
                    >
                      <FormFieldLabel
                        name="loggedTime"
                        label="Zarejestrowany czas (w, d, h, m)"
                        tooltipContent="Użyj formatu: 1w 2d 3h 4m (tydzień, dzień, godzina, minuta)"
                      />
                      <Input
                        id="loggedTime"
                        name="loggedTime"
                        type="text"
                        defaultValue={formatEstimatedTime(
                          issue.loggedTime ?? 0,
                        )}
                        onBlur={(e) =>
                          handleFieldBlur("loggedTime", e.currentTarget.value)
                        }
                      />
                      {clientErrors.loggedTime && (
                        <Form.Message asChild>
                          <TypographyInvalid>
                            {clientErrors.loggedTime}
                          </TypographyInvalid>
                        </Form.Message>
                      )}
                    </FormField>
                  </div>
                </div>

                <Form.Field
                  name="assignees"
                  className="grid gap-2"
                  serverInvalid={serverErrors.assignees.isInvalid}
                >
                  <Form.Label asChild>
                    <Label htmlFor="assignees">Przypisane osoby</Label>
                  </Form.Label>

                  <ComboBox
                    title="Przypisz osobę"
                    items={
                      projectMembers?.map((item) => ({
                        label: item.member.username || item.member.email,
                        value: item.member["@id"],
                      })) ?? []
                    }
                    placeholder="Szukaj osób..."
                    onSelect={handleAssigneesChange}
                    selectedValues={assignedUsers.map((u) => u.iri)}
                  />

                  {assignedUsers.map((assignee) => (
                    <input
                      key={assignee.iri}
                      type="hidden"
                      name="assignees"
                      value={assignee.iri}
                    />
                  ))}

                  {assignedUsers.length > 0 ? (
                    <div className="flex flex-wrap gap-2 rounded-lg border border-dashed border-border p-3">
                      {assignedUsers.map((assignee) => (
                        <AssigneeAvatar
                          key={assignee.iri}
                          userIri={assignee.iri}
                          size="small"
                          ariaLabel={assignee.label}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Brak przypisanych osób
                    </p>
                  )}

                  {serverErrors.assignees.isInvalid && (
                    <Form.Message asChild>
                      <TypographyInvalid>
                        {serverErrors.assignees.message}
                      </TypographyInvalid>
                    </Form.Message>
                  )}
                </Form.Field>

                <IssueTags issue={issue} />

                <IssueSprints
                  issue={issue}
                  availableSprints={sprints}
                  organizationId={organizationId}
                  projectId={projectId}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end py-4">
              {serverErrors.form?.isInvalid && (
                <span className="mr-auto">
                  <TypographyInvalid>
                    {serverErrors.form.message}
                  </TypographyInvalid>
                </span>
              )}
              <Button type="submit" disabled={pending} className="min-w-32">
                Zapisz zmiany
                {pending && (
                  <Loader2Icon className="ml-2 size-4 animate-spin" />
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Form.Root>

      <Comments issueId={issue.id.toString()} initialComments={comments} />

      <IssueSoftDeleteContainer issueId={issue.id} projectId={projectId} />
    </>
  );
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0] ?? "";
}
