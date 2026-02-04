import { useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Trash2 } from "lucide-react";
import React, { useState } from "react";

import updateSprintStatus from "@/actions/updateSprintStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAlert } from "@/hooks/useAlert";
import type { Sprint } from "@/lib/types/api";
import { SprintStatusEnum } from "@/lib/types/api";
import { formatDateTime } from "@/lib/utils/dateHelpers";

import { DeleteSprintDialog } from "../Project/DeleteSprintDialog";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SprintBacklog } from "./SprintBacklog";

export function SprintContainer({
  sprint,
  projectId,
  organizationId,
  hasActiveSprint,
}: {
  sprint: Sprint;
  projectId: string;
  organizationId: string;
  hasActiveSprint: boolean;
}) {
  const queryClient = useQueryClient();
  const { notify } = useAlert();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleStatusChange = async (status: string) => {
    const result = await updateSprintStatus(null, {
      sprintId: sprint.id.toString(),
      organizationId,
      projectId,
      status,
    });

    if (result.ok) {
      notify({
        type: "default",
        title: "Status sprintu zaktualizowany",
      });
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    } else {
      notify({
        type: "destructive",
        title: "Błąd aktualizacji statusu",
        description: result.message || "Wystąpił nieoczekiwany błąd",
      });
    }
  };

  return (
    <>
      <AccordionItem
        value={sprint.id.toString()}
        className="w-full bg-light rounded-lg border-l-3 border-b-0 border-primary px-4 pt-2"
      >
        <AccordionTrigger className="py-2 pt-0">
          <h3 className="text-lg font-semibold">{sprint.name}</h3>
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="text-base">{sprint.goal}</div>
              <div className="flex gap-2 text-gray-600 dark:text-gray-50 text-sm">
                {sprint.startDate && (
                  <>
                    <span suppressHydrationWarning>
                      {formatDateTime(new Date(sprint.startDate))}
                    </span>{" "}
                    -{" "}
                  </>
                )}
                {sprint.endDate && (
                  <span suppressHydrationWarning>
                    {formatDateTime(new Date(sprint.endDate))}
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-gray-600 dark:text-gray-50 text-sm">
                {sprint.createdAt && (
                  <>
                    <span suppressHydrationWarning>
                      {formatDateTime(new Date(sprint.createdAt))}
                    </span>{" "}
                    -{" "}
                  </>
                )}
                {sprint.updatedAt && (
                  <span suppressHydrationWarning>
                    {formatDateTime(new Date(sprint.updatedAt))}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="min-w-[180px]">
                <Select
                  defaultValue={sprint.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SprintStatusEnum.CREATED}>
                      Utworzony
                    </SelectItem>
                    <SelectItem
                      value={SprintStatusEnum.STARTED}
                      disabled={
                        hasActiveSprint &&
                        sprint.status !== SprintStatusEnum.STARTED
                      }
                    >
                      Aktywny
                    </SelectItem>
                    <SelectItem value={SprintStatusEnum.COMPLETED}>
                      Zakończony
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Usuń
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <SprintBacklog sprint={sprint} projectId={projectId} />
        </AccordionContent>
      </AccordionItem>

      <DeleteSprintDialog
        projectId={projectId}
        sprintId={sprint.id}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
