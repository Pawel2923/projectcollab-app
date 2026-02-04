"use client";

import { PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import { AddIssueForm } from "@/components/Issue/AddIssueForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useErrorHandler } from "@/hooks/useErrorHandler";

type AddIssueModalProps = {
  projectId: string;
  organizationId?: string;
  trigger?: React.ReactElement;
};

type IssueStatus = {
  id: number;
  value: string;
};

type IssueType = {
  id: number;
  value: string;
};

type ApiResponse<T> = {
  member: T[];
};

export function AddIssueModal({
  projectId,
  organizationId,
  trigger,
}: AddIssueModalProps) {
  const [open, setOpen] = useState(false);
  const [statuses, setStatuses] = useState<{ id: string; value: string }[]>([]);
  const [types, setTypes] = useState<{ id: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useErrorHandler();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusesRes, typesRes] = await Promise.all([
          fetch("/api/proxy?endpoint=/issue_statuses"),
          fetch("/api/proxy?endpoint=/issue_types"),
        ]);

        const [statusesData, typesData] = await Promise.all([
          statusesRes.json(),
          typesRes.json(),
        ]);

        if (!statusesRes.ok) {
          showError(statusesData);
        } else {
          const statuses: ApiResponse<IssueStatus> = statusesData;
          setStatuses(
            statuses.member.map((status) => ({
              id: status.id.toString(),
              value: status.value,
            })),
          );
        }

        if (!typesRes.ok) {
          showError(typesData);
        } else {
          const types: ApiResponse<IssueType> = typesData;
          setTypes(
            types.member.map((type) => ({
              id: type.id.toString(),
              value: type.value,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch issue metadata:", error);
        showError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="text-foreground active:text-opacity-70">
            <PlusIcon /> Dodaj zadanie
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj nowe zadanie do projektu</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Ładowanie...
          </div>
        ) : (
          <AddIssueForm
            projectId={projectId}
            organizationId={organizationId}
            statuses={statuses}
            types={types}
            onSuccess={() => setOpen(false)}
          />
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="circular">Anuluj</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
