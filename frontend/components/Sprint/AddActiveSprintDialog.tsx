import { Loader2Icon } from "lucide-react";
import { Form } from "radix-ui";
import React, {
  useActionState,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import updateSprintStatus from "@/actions/updateSprintStatus";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useServerValidation } from "@/hooks/useServerValidation";
import { AppError } from "@/services/error/app-error";
import { clientApiGet } from "@/services/fetch/client-api-service";
import { useOrganization } from "@/store/OrganizationContext";
import type { Collection } from "@/types/api/collection";
import type { Sprint } from "@/types/api/sprint";
import { SprintStatusEnum } from "@/types/api/sprint";

import { Button } from "../ui/button";
import type { ComboBoxItem } from "../ui/combobox";
import { ComboBox } from "../ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FormField, FormFieldLabel } from "../ui/Form/FormField";

interface AddActiveSprintDialogProps {
  projectId: string;
}

const FORM_FIELDS = ["sprintId", "organizationId", "projectId"] as const;

export function AddActiveSprintDialog({
  projectId,
}: AddActiveSprintDialogProps) {
  const orgCtx = useOrganization();

  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [comboboxItems, setComboboxItems] = useState<ComboBoxItem[]>([]);
  const { showError } = useErrorHandler();

  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  const [state, formAction, isActionPending] = useActionState(
    updateSprintStatus,
    null,
  );
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
  );

  // Fetch sprints with created status
  useEffect(() => {
    const fetchSprints = async () => {
      setIsPending(true);
      const sprintsResult = await clientApiGet<Collection<Sprint>>(
        `/sprints?projectId=${projectId}&status=created`,
      );

      const sprints = sprintsResult.ok
        ? sprintsResult.value
        : sprintsResult.error;
      if (sprints instanceof AppError) {
        showError(sprints);
        return;
      }

      setComboboxItems(
        sprints.member.map((sprint) => ({
          label: sprint.name,
          value: sprint.id.toString(),
        })),
      );
      setIsPending(false);
    };

    fetchSprints();
  }, [projectId, showError]);

  // Add loading state to combobox items
  useLayoutEffect(() => {
    if (isPending) {
      setComboboxItems([
        {
          label: "Ładowanie...",
          value: "",
        },
      ]);
    }
  }, [isPending]);

  // log state changes
  useEffect(() => {
    console.log(state);

    if (state?.ok) {
      setOpen(false);
      window.location.reload();
    }
  }, [state, showError]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Wybierz sprint do aktywacji</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wybierz sprint do aktywacji</DialogTitle>
          <DialogDescription>
            Wybrany sprint zostanie aktywowany i dodany do listy aktywnych
            sprintów. Pozostałe aktywne sprinty zostaną automatycznie
            zakończone.
          </DialogDescription>
        </DialogHeader>

        <Form.Root
          className="space-y-6"
          action={formAction}
          onSubmit={clearServerErrors}
          onReset={clearServerErrors}
        >
          <input
            type="hidden"
            name="organizationId"
            value={orgCtx?.organizationId}
          />
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="status" value={SprintStatusEnum.STARTED} />

          <FormField
            name="sprintId"
            label=""
            serverInvalid={serverErrors.sprintId.isInvalid}
            serverMessage={serverErrors.sprintId.message}
            asChild
          >
            <FormFieldLabel label="Sprint*" name="sprintId" />
            <ComboBox
              placeholder="Wyszukaj sprint"
              title="Wybierz sprint"
              items={comboboxItems}
              onSelect={(value) => setSelectedSprintId(value)}
            />
            <input
              type="hidden"
              name="sprintId"
              value={selectedSprintId ?? ""}
            />
          </FormField>

          {serverErrors.form?.isInvalid && (
            <div className="text-destructive">{serverErrors.form.message}</div>
          )}

          <Form.Submit asChild>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isActionPending || !selectedSprintId}
            >
              Aktywuj
              {(isPending || isActionPending) && (
                <Loader2Icon className="animate-spin" />
              )}
            </Button>
          </Form.Submit>
        </Form.Root>
      </DialogContent>
    </Dialog>
  );
}
