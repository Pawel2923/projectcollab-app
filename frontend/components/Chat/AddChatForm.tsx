import { Loader2Icon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Form } from "radix-ui";
import React, {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import createChat from "@/actions/createChat";
import { useAlert } from "@/hooks/useAlert";
import { useServerValidation } from "@/hooks/useServerValidation";
import type { OrganizationMember } from "@/types/api/organization";
import type { ChatLinkedResources } from "@/types/ui/chat-linked-resources";

import { TypographyInvalid } from "../typography/TypographyInvalid";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ComboBox } from "../ui/combobox";
import { DialogClose, DialogFooter } from "../ui/dialog";
import { FormField, FormFieldLabel } from "../ui/Form/FormField";
import { FormInput } from "../ui/Form/FormInput";
import { FormSelect } from "../ui/Form/FormSelect";
import { SelectGroup, SelectItem } from "../ui/select";

interface AddChatFormProps {
  organizationId?: string;
  organizationMembers?: OrganizationMember[];
  currentUserId?: number;
  chatResources?: ChatLinkedResources;
}

const FORM_FIELDS = [
  "type",
  "name",
  "invitedUser",
  "members",
  "projectId",
  "sprintId",
  "issueId",
] as const;

const EMPTY_SELECT_VALUE = "__none__";

type MemberSourceKind = "manual" | "project" | "issue";

interface MemberSource {
  kind: MemberSourceKind;
  refId?: string;
}

interface SelectedMember {
  email: string;
  sources: MemberSource[];
}

export function AddChatForm({
  organizationId,
  organizationMembers = [],
  currentUserId,
  chatResources,
}: AddChatFormProps) {
  const [state, formAction, pending] = useActionState(createChat, null);
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
  );

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { notify } = useAlert();
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      notify({
        type: "default",
        title: "Utworzono czat",
        description: "Czat został pomyślnie utworzony.",
        duration: 4000,
        hasCloseButton: true,
        icon: "check",
      });

      closeButtonRef.current?.click();
      router.refresh();
    }
  }, [notify, state, router]);

  const [chatType, setChatType] = useState<string | undefined>(undefined);
  const [invitedUser, setInvitedUser] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [selectedSprintId, setSelectedSprintId] = useState<string>();
  const [selectedIssueId, setSelectedIssueId] = useState<string>();

  const linkedProjects = useMemo(
    () => chatResources?.projects ?? [],
    [chatResources],
  );

  const projectResourceById = useMemo(() => {
    const map = new Map<string, ChatLinkedResources["projects"][number]>();
    linkedProjects.forEach((entry) => {
      map.set(String(entry.project.id), entry);
    });
    return map;
  }, [linkedProjects]);

  const projectOptions = useMemo(
    () =>
      linkedProjects.map((entry) => ({
        label: entry.project.name,
        value: String(entry.project.id),
      })),
    [linkedProjects],
  );

  const currentProjectResource = useMemo(() => {
    if (!selectedProjectId) {
      return undefined;
    }

    return projectResourceById.get(selectedProjectId);
  }, [projectResourceById, selectedProjectId]);

  const sprintOptions = useMemo(() => {
    if (!currentProjectResource) {
      return [];
    }

    return currentProjectResource.sprints.map((sprint) => ({
      label: sprint.name,
      value: String(sprint.id),
    }));
  }, [currentProjectResource]);

  const issueOptions = useMemo(() => {
    if (!currentProjectResource) {
      return [];
    }

    return currentProjectResource.issues.map((issue) => ({
      label: issue.key ? `${issue.key} – ${issue.title}` : issue.title,
      value: String(issue.id),
    }));
  }, [currentProjectResource]);

  const projectNameMap = useMemo(() => {
    const map = new Map<string, string>();
    linkedProjects.forEach(({ project }) => {
      map.set(String(project.id), project.name);
    });
    return map;
  }, [linkedProjects]);

  const issueLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    linkedProjects.forEach(({ issues }) => {
      issues.forEach((issue) => {
        const label = issue.key ? `${issue.key} – ${issue.title}` : issue.title;
        map.set(String(issue.id), label);
      });
    });
    return map;
  }, [linkedProjects]);

  const memberItems = useMemo(() => {
    return organizationMembers
      .filter((member) => member.member.id !== currentUserId)
      .map((member) => {
        const email = member.member?.email?.trim();

        if (!email) {
          return null;
        }

        return {
          label: member.member?.username || email || "Unknown",
          value: email,
        };
      })
      .filter((member): member is { label: string; value: string } => !!member);
  }, [currentUserId, organizationMembers]);

  const allMemberEmails = useMemo(
    () => memberItems.map((member) => member.value).filter(Boolean),
    [memberItems],
  );

  const memberLabelMap = useMemo(() => {
    return new Map(memberItems.map((member) => [member.value, member.label]));
  }, [memberItems]);

  const selectedMemberEmails = useMemo(
    () => selectedMembers.map((member) => member.email),
    [selectedMembers],
  );

  const manualOrgMembersCount = useMemo(
    () =>
      selectedMembers.filter(
        (member) =>
          allMemberEmails.includes(member.email) &&
          member.sources.some((source) => source.kind === "manual"),
      ).length,
    [allMemberEmails, selectedMembers],
  );

  useEffect(() => {
    setSelectedMembers((prev) =>
      prev
        .map((member) => {
          if (allMemberEmails.includes(member.email)) {
            return member;
          }

          const hasAutoSource = member.sources.some(
            (source) => source.kind !== "manual",
          );

          return hasAutoSource ? member : null;
        })
        .filter((member): member is SelectedMember => Boolean(member)),
    );
  }, [allMemberEmails]);

  const allMembersSelected =
    allMemberEmails.length > 0 &&
    manualOrgMembersCount === allMemberEmails.length;

  const isGroupChat = chatType === "group";

  const typeChangeHandler = (value: string) => {
    setChatType(value);
    if (value !== "group") {
      setSelectedMembers([]);
      setSelectedProjectId(undefined);
      setSelectedSprintId(undefined);
      setSelectedIssueId(undefined);
    }
    if (value !== "direct") {
      setInvitedUser("");
    }
  };

  const invitedUserSelectHandler = (value: string) => {
    setInvitedUser(value);
  };

  const groupMemberSelectHandler = (value: string) => {
    if (!value) {
      return;
    }

    setSelectedMembers((prev) => {
      const existingIndex = prev.findIndex((member) => member.email === value);

      if (existingIndex === -1) {
        return [
          ...prev,
          { email: value, sources: [{ kind: "manual" as const }] },
        ];
      }

      const existing = prev[existingIndex];
      const hasManualSource = existing.sources.some(
        (source) => source.kind === "manual",
      );

      const updatedSources = hasManualSource
        ? existing.sources.filter((source) => source.kind !== "manual")
        : [...existing.sources, { kind: "manual" as const }];

      if (updatedSources.length === 0) {
        return prev.filter((_, index) => index !== existingIndex);
      }

      const next = [...prev];
      next[existingIndex] = { ...existing, sources: updatedSources };
      return next;
    });
  };

  const removeSelectedMember = (value: string) => {
    setSelectedMembers((prev) =>
      prev.filter((member) => member.email !== value),
    );
  };

  const toggleSelectAllMembers = () => {
    if (!allMemberEmails.length) {
      return;
    }

    setSelectedMembers((prev) => {
      const currentManualCount = prev.filter(
        (member) =>
          allMemberEmails.includes(member.email) &&
          member.sources.some((source) => source.kind === "manual"),
      ).length;

      const shouldSelectAll = currentManualCount !== allMemberEmails.length;

      if (!shouldSelectAll) {
        return prev
          .map((member) => {
            if (!allMemberEmails.includes(member.email)) {
              return member;
            }

            const remainingSources = member.sources.filter(
              (source) => source.kind !== "manual",
            );

            if (remainingSources.length === 0) {
              return null;
            }

            if (remainingSources.length === member.sources.length) {
              return member;
            }

            return { ...member, sources: remainingSources };
          })
          .filter((member): member is SelectedMember => Boolean(member));
      }

      const next = [...prev];

      allMemberEmails.forEach((email) => {
        const index = next.findIndex((member) => member.email === email);
        if (index === -1) {
          next.push({ email, sources: [{ kind: "manual" as const }] });
          return;
        }

        if (!next[index].sources.some((source) => source.kind === "manual")) {
          next[index] = {
            ...next[index],
            sources: [...next[index].sources, { kind: "manual" as const }],
          };
        }
      });

      return next;
    });
  };

  const handleProjectChange = (value: string) => {
    const normalizedValue = value === EMPTY_SELECT_VALUE ? undefined : value;
    setSelectedProjectId(normalizedValue);
    setSelectedSprintId(undefined);
    setSelectedIssueId(undefined);
  };

  const handleSprintChange = (value: string) => {
    setSelectedSprintId(value === EMPTY_SELECT_VALUE ? undefined : value);
  };

  const handleIssueChange = (value: string) => {
    setSelectedIssueId(value === EMPTY_SELECT_VALUE ? undefined : value);
  };

  useEffect(() => {
    setSelectedMembers((prev) => {
      const withoutProjectMembers = stripSourcesByKind(prev, "project");

      if (!isGroupChat || !selectedProjectId) {
        return withoutProjectMembers;
      }

      const projectResource = projectResourceById.get(selectedProjectId);
      if (!projectResource) {
        return withoutProjectMembers;
      }

      const emails = projectResource.members
        .map((member) => {
          if (member.member?.id === currentUserId) {
            return undefined;
          }
          return member.member?.email?.trim();
        })
        .filter((email): email is string => Boolean(email));

      if (emails.length === 0) {
        return withoutProjectMembers;
      }

      return addMembersFromEmails(withoutProjectMembers, emails, {
        kind: "project",
        refId: selectedProjectId,
      });
    });
  }, [isGroupChat, selectedProjectId, projectResourceById, currentUserId]);

  useEffect(() => {
    setSelectedMembers((prev) => {
      const withoutIssueMembers = stripSourcesByKind(prev, "issue");

      if (!isGroupChat || !selectedIssueId || !currentProjectResource) {
        return withoutIssueMembers;
      }

      const issue = currentProjectResource.issues.find(
        (item) => String(item.id) === selectedIssueId,
      );

      if (!issue) {
        return withoutIssueMembers;
      }

      const participantEmails = new Set<string>();

      if (issue.reporter?.email && issue.reporter.id !== currentUserId) {
        participantEmails.add(issue.reporter.email.trim());
      }

      issue.assignees.forEach((assignee) => {
        if (assignee.email && assignee.id !== currentUserId) {
          participantEmails.add(assignee.email.trim());
        }
      });

      if (participantEmails.size === 0) {
        return withoutIssueMembers;
      }

      return addMembersFromEmails(
        withoutIssueMembers,
        Array.from(participantEmails),
        {
          kind: "issue",
          refId: selectedIssueId,
        },
      );
    });
  }, [isGroupChat, selectedIssueId, currentProjectResource, currentUserId]);

  return (
    <Form.Root
      className="grid space-y-4"
      action={formAction}
      onSubmit={clearServerErrors}
      onReset={clearServerErrors}
    >
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="type" value={chatType || ""} />

      <FormSelect
        name="type"
        label="Typ czatu"
        serverInvalid={serverErrors.type?.isInvalid || false}
        serverMessage={serverErrors.type?.message}
        valueMissingMessage="Typ czatu jest wymagany"
        selectProps={{
          onValueChange: typeChangeHandler,
          value: chatType,
        }}
        placeholder="Wybierz typ czatu"
      >
        <SelectGroup>
          <SelectItem value="group">Grupowy</SelectItem>
          <SelectItem value="direct">Bezpośredni</SelectItem>
        </SelectGroup>
      </FormSelect>

      {chatType === "direct" && (
        <FormField
          name="invitedUser"
          label="Zaproś użytkownika (email)"
          serverInvalid={serverErrors.invitedUser?.isInvalid || false}
          serverMessage={serverErrors.invitedUser?.message}
          asChild
        >
          <FormFieldLabel
            name="invitedUser"
            label="Zaproś użytkownika (email)"
          />
          <ComboBox
            title="Wybierz użytkownika"
            placeholder="Wyszukaj użytkownika"
            items={memberItems}
            onSelect={invitedUserSelectHandler}
          />
          <input
            type="hidden"
            name="invitedUser"
            id="invitedUser"
            value={invitedUser}
          />
        </FormField>
      )}

      {isGroupChat && (
        <div className="space-y-4 rounded-lg border border-dashed border-border/70 p-4">
          <p className="text-sm text-muted-foreground">
            Powiąż czat z projektem, sprintem lub zadaniem. Uczestnicy zostaną
            dodani automatycznie i zawsze możesz ich edytować.
          </p>
          <FormSelect
            name="projectId"
            label="Powiąż projekt"
            serverInvalid={serverErrors.projectId?.isInvalid || false}
            serverMessage={serverErrors.projectId?.message}
            selectProps={{
              value: selectedProjectId ?? EMPTY_SELECT_VALUE,
              onValueChange: handleProjectChange,
            }}
            placeholder={
              projectOptions.length
                ? "Wybierz projekt"
                : "Brak dostępnych projektów"
            }
          >
            <SelectGroup>
              <SelectItem value={EMPTY_SELECT_VALUE}>
                Brak powiązania
              </SelectItem>
              {projectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </FormSelect>

          {selectedProjectId && (
            <div className="grid gap-4 md:grid-cols-2">
              <FormSelect
                name="sprintId"
                label="Powiąż sprint"
                serverInvalid={serverErrors.sprintId?.isInvalid || false}
                serverMessage={serverErrors.sprintId?.message}
                selectProps={{
                  value: selectedSprintId ?? EMPTY_SELECT_VALUE,
                  onValueChange: handleSprintChange,
                  disabled: !sprintOptions.length,
                }}
                placeholder={
                  sprintOptions.length ? "Wybierz sprint" : "Brak sprintów"
                }
              >
                <SelectGroup>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    Brak powiązania
                  </SelectItem>
                  {sprintOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </FormSelect>

              <FormSelect
                name="issueId"
                label="Powiąż zadanie"
                serverInvalid={serverErrors.issueId?.isInvalid || false}
                serverMessage={serverErrors.issueId?.message}
                selectProps={{
                  value: selectedIssueId ?? EMPTY_SELECT_VALUE,
                  onValueChange: handleIssueChange,
                  disabled: !issueOptions.length,
                }}
                placeholder={
                  issueOptions.length ? "Wybierz zadanie" : "Brak zadań"
                }
              >
                <SelectGroup>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    Brak powiązania
                  </SelectItem>
                  {issueOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </FormSelect>
            </div>
          )}
        </div>
      )}

      {isGroupChat && (
        <FormField
          name="members"
          label="Dodaj uczestników"
          serverInvalid={serverErrors.members?.isInvalid || false}
          serverMessage={serverErrors.members?.message}
          asChild
        >
          <>
            <FormFieldLabel name="members" label="Dodaj uczestników" />
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <ComboBox
                  title={
                    selectedMemberEmails.length
                      ? `Wybrano ${selectedMemberEmails.length} uczestników`
                      : "Wybierz uczestników"
                  }
                  placeholder="Wyszukaj użytkownika"
                  items={memberItems}
                  onSelect={groupMemberSelectHandler}
                  selectedValues={selectedMemberEmails}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAllMembers}
                  disabled={!memberItems.length}
                >
                  {allMembersSelected ? "Usuń wszystkich" : "Dodaj wszystkich"}
                </Button>
              </div>
              {selectedMembers.length > 0 ? (
                <div className="flex flex-wrap gap-2 rounded-lg border border-dashed border-border p-3">
                  {selectedMembers.map((member) => {
                    const memberLabel =
                      memberLabelMap.get(member.email) || member.email;
                    const autoSources = member.sources.filter(
                      (source) => source.kind !== "manual",
                    );

                    return (
                      <Badge
                        key={member.email}
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">
                            {memberLabel}
                          </span>
                          {autoSources.length > 0 && (
                            <div className="flex flex-wrap gap-1 text-[10px] uppercase text-muted-foreground">
                              {autoSources.map((source) => {
                                const sourceLabel =
                                  source.kind === "project"
                                    ? projectNameMap.get(source.refId || "") ||
                                      "Projekt"
                                    : issueLabelMap.get(source.refId || "") ||
                                      "Zadanie";

                                return (
                                  <span
                                    key={`${member.email}-${source.kind}-${source.refId}`}
                                    className="rounded bg-muted px-1 py-0.5"
                                  >
                                    {source.kind === "project"
                                      ? `Projekt: ${sourceLabel}`
                                      : `Zadanie: ${sourceLabel}`}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="dynamic"
                          type="button"
                          onClick={() => removeSelectedMember(member.email)}
                          className="inline-flex items-center justify-center hover:text-destructive"
                          aria-label={`Usuń ${memberLabel} z czatu`}
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {memberItems.length
                    ? "Nie dodano jeszcze uczestników."
                    : "Brak dostępnych członków w tej organizacji."}
                </p>
              )}
            </div>
            {selectedMemberEmails.map((email) => (
              <input key={email} type="hidden" name="members" value={email} />
            ))}
          </>
        </FormField>
      )}

      {chatType && (
        <FormInput
          name="name"
          label="Nazwa czatu"
          serverInvalid={serverErrors.name?.isInvalid || false}
          serverMessage={serverErrors.name?.message}
          inputProps={{ defaultValue: "" }}
        />
      )}

      {serverErrors.form?.isInvalid && (
        <TypographyInvalid>{serverErrors.form.message}</TypographyInvalid>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button
            ref={closeButtonRef}
            variant="secondary"
            onClick={clearServerErrors}
          >
            Anuluj
          </Button>
        </DialogClose>
        <Form.Submit asChild>
          <Button
            type="submit"
            disabled={pending || serverErrors.form?.isInvalid}
          >
            Utwórz czat
            {pending && <Loader2Icon className="animate-spin ml-2" />}
          </Button>
        </Form.Submit>
      </DialogFooter>
    </Form.Root>
  );
}

function stripSourcesByKind(
  members: SelectedMember[],
  kind: MemberSourceKind,
): SelectedMember[] {
  return members
    .map((member) => {
      const remainingSources = member.sources.filter(
        (source) => source.kind !== kind,
      );

      if (remainingSources.length === 0) {
        return null;
      }

      if (remainingSources.length === member.sources.length) {
        return member;
      }

      return { ...member, sources: remainingSources };
    })
    .filter((member): member is SelectedMember => Boolean(member));
}

function addMembersFromEmails(
  members: SelectedMember[],
  emails: string[],
  source: MemberSource,
): SelectedMember[] {
  const uniqueEmails = Array.from(new Set(emails));
  const next = [...members];

  uniqueEmails.forEach((email) => {
    const index = next.findIndex((member) => member.email === email);

    if (index === -1) {
      next.push({ email, sources: [source] });
      return;
    }

    const existing = next[index];
    const hasSource = existing.sources.some(
      (entry) => entry.kind === source.kind && entry.refId === source.refId,
    );

    if (!hasSource) {
      next[index] = {
        ...existing,
        sources: [...existing.sources, source],
      };
    }
  });

  return next;
}
