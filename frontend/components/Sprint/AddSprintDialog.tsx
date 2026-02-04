"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { AddSprintForm } from "./AddSprintForm";

type AddSprintDialogProps = {
  projectId: string;
};

export function AddSprintDialog({ projectId }: AddSprintDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    setOpen(false);
    // Invalidate and refetch sprints
    queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Dodaj sprint
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Utwórz nowy sprint</DialogTitle>
        </DialogHeader>
        <AddSprintForm projectId={projectId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
