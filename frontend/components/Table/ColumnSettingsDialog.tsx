"use client";

import {
  EditIcon,
  Loader2Icon,
  PlusIcon,
  Settings2,
  Trash2Icon,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isOk } from "@/error/result";
import { clientApiCall, clientApiGet } from "@/lib/utils/clientApiClient";
import type { Collection } from "@/types/api/collection";
import type { IssueStatus, IssueType } from "@/types/api/issue";
import type { Sprint } from "@/types/api/sprint";

type ColumnSettingsDialogProps = {
  projectId: string;
};

export function ColumnSettingsDialog({ projectId }: ColumnSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("statuses");

  // Issue Statuses
  const [issueStatuses, setIssueStatuses] = useState<IssueStatus[]>([]);
  const [newStatusValue, setNewStatusValue] = useState("");
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [editingStatusValue, setEditingStatusValue] = useState("");

  // Issue Types
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [newTypeValue, setNewTypeValue] = useState("");
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [editingTypeValue, setEditingTypeValue] = useState("");

  // Sprints
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [currentSprint, setCurrentSprint] = useState<string>("");
  const [newSprintName, setNewSprintName] = useState("");
  const [newSprintGoal, setNewSprintGoal] = useState("");
  const [newSprintStartDate, setNewSprintStartDate] = useState("");
  const [newSprintEndDate, setNewSprintEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get current datetime in YYYY-MM-DDTHH:MM format for min attribute
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  // Fetch data when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [statusesRes, typesRes, sprintsRes] = await Promise.all([
          clientApiGet<Collection<IssueStatus>>("/issue_statuses").catch(
            () => null,
          ),
          clientApiGet<Collection<IssueType>>("/issue_types").catch(() => null),
          clientApiGet<Collection<Sprint>>(
            `/sprints?project=${projectId}`,
          ).catch(() => null),
        ]);

        const statusesData =
          statusesRes && isOk(statusesRes) ? statusesRes.value : null;
        const typesData = typesRes && isOk(typesRes) ? typesRes.value : null;
        const sprintsData =
          sprintsRes && isOk(sprintsRes) ? sprintsRes.value : null;

        if (statusesData) setIssueStatuses(statusesData.member || []);
        if (typesData) setIssueTypes(typesData.member || []);
        if (sprintsData) {
          setSprints(sprintsData.member || []);
          // Find the current active sprint
          const activeSprint = sprintsData.member?.find(
            (s: Sprint) => s.status === "started" && !s.isArchived,
          );
          if (activeSprint?.["@id"]) {
            setCurrentSprint(activeSprint["@id"]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, projectId]);

  // Issue Status handlers
  const handleAddStatus = async () => {
    if (!newStatusValue.trim()) return;

    setSaving(true);
    try {
      const response = await clientApiCall<IssueStatus>("/issue_statuses", {
        method: "POST",
        body: { value: newStatusValue.trim() },
      });

      const newStatus = response && isOk(response) ? response.value : null;
      if (newStatus) {
        setIssueStatuses([...issueStatuses, newStatus]);
        setNewStatusValue("");
      }
    } catch (error) {
      console.error("Failed to add status:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, value: string) => {
    if (!value.trim()) return;

    setSaving(true);
    try {
      await clientApiCall(`/issue_statuses/${id}`, {
        method: "PATCH",
        body: { value: value.trim() },
        headers: { "Content-Type": "application/merge-patch+json" },
      });

      setIssueStatuses(
        issueStatuses.map((s) =>
          s.id === id ? { ...s, value: value.trim() } : s,
        ),
      );
      setEditingStatusId(null);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStatus = async (id: number) => {
    setSaving(true);
    try {
      await clientApiCall(`/issue_statuses/${id}`, {
        method: "DELETE",
      });

      setIssueStatuses(issueStatuses.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete status:", error);
    } finally {
      setSaving(false);
    }
  };

  // Issue Type handlers
  const handleAddType = async () => {
    if (!newTypeValue.trim()) return;

    setSaving(true);
    try {
      const response = await clientApiCall<IssueType>("/issue_types", {
        method: "POST",
        body: { value: newTypeValue.trim() },
      });

      const newType = response && isOk(response) ? response.value : null;
      if (newType) {
        setIssueTypes([...issueTypes, newType]);
        setNewTypeValue("");
      }
    } catch (error) {
      console.error("Failed to add type:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateType = async (id: number, value: string) => {
    if (!value.trim()) return;

    setSaving(true);
    try {
      await clientApiCall(`/issue_types/${id}`, {
        method: "PATCH",
        body: { value: value.trim() },
        headers: { "Content-Type": "application/merge-patch+json" },
      });

      setIssueTypes(
        issueTypes.map((t) =>
          t.id === id ? { ...t, value: value.trim() } : t,
        ),
      );
      setEditingTypeId(null);
    } catch (error) {
      console.error("Failed to update type:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteType = async (id: number) => {
    setSaving(true);
    try {
      await clientApiCall(`/issue_types/${id}`, {
        method: "DELETE",
      });

      setIssueTypes(issueTypes.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete type:", error);
    } finally {
      setSaving(false);
    }
  };

  // Sprint handlers
  const handleAddSprint = async () => {
    if (!newSprintName.trim()) return;

    // Validate dates
    if (newSprintStartDate && newSprintEndDate) {
      const start = new Date(newSprintStartDate);
      const end = new Date(newSprintEndDate);
      const now = new Date();

      if (start < now) {
        console.error("Start date cannot be in the past");
        return;
      }

      if (end <= start) {
        console.error("End date must be after start date");
        return;
      }
    }

    setSaving(true);
    try {
      // Convert datetime-local format to ISO 8601 format for API
      const startDateTime = newSprintStartDate
        ? new Date(newSprintStartDate).toISOString()
        : undefined;
      const endDateTime = newSprintEndDate
        ? new Date(newSprintEndDate).toISOString()
        : undefined;

      const response = await clientApiCall<Sprint>("/sprints", {
        method: "POST",
        body: {
          name: newSprintName.trim(),
          goal: newSprintGoal.trim() || undefined,
          startDate: startDateTime,
          endDate: endDateTime,
          status: "created",
          isArchived: false,
          project: `/projects/${projectId}`,
        },
      });

      const newSprint = response && isOk(response) ? response.value : null;
      if (newSprint) {
        setSprints([...sprints, newSprint]);
        setCurrentSprint(newSprint["@id"] || "");
      }
      setNewSprintName("");
      setNewSprintGoal("");
      setNewSprintStartDate("");
      setNewSprintEndDate("");
    } catch (error) {
      console.error("Failed to add sprint:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeCurrentSprint = async () => {
    if (!currentSprint) return;

    setSaving(true);
    try {
      // Stop all currently active sprints
      const activeSprintIds = sprints
        .filter((s) => s.status === "started" && !s.isArchived)
        .map((s) => s.id);

      await Promise.all(
        activeSprintIds.map((id) =>
          clientApiCall(`/sprints/${id}`, {
            method: "PATCH",
            body: { status: "completed" },
            headers: { "Content-Type": "application/merge-patch+json" },
          }),
        ),
      );

      // Start the selected sprint
      const sprintId = currentSprint.split("/").pop();
      await clientApiCall(`/sprints/${sprintId}`, {
        method: "PATCH",
        body: { status: "started" },
        headers: { "Content-Type": "application/merge-patch+json" },
      });

      // Refresh sprints list
      const sprintsRes = await clientApiGet<Collection<Sprint>>(
        `/sprints?project=${projectId}`,
      );
      const sprintsData =
        sprintsRes && isOk(sprintsRes) ? sprintsRes.value : null;
      if (sprintsData) setSprints(sprintsData.member || []);
    } catch (error) {
      console.error("Failed to change current sprint:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-background border border-border"
        >
          <Settings2 />
          Ustawienia tablicy
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ustawienia tablicy</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="animate-spin mr-2" />
            Ładowanie...
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="statuses">Statusy</TabsTrigger>
              <TabsTrigger value="types">Typy</TabsTrigger>
              <TabsTrigger value="sprints">Sprinty</TabsTrigger>
            </TabsList>

            {/* Issue Statuses Tab */}
            <TabsContent value="statuses" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Dodaj nowy status</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nazwa statusu..."
                    value={newStatusValue}
                    onChange={(e) => setNewStatusValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
                  />
                  <Button
                    onClick={handleAddStatus}
                    disabled={saving || !newStatusValue.trim()}
                  >
                    {saving ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <PlusIcon />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Istniejące statusy</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {issueStatuses.map((status) => (
                    <div key={status.id} className="flex gap-2 items-center">
                      {editingStatusId === status.id ? (
                        <>
                          <Input
                            value={editingStatusValue}
                            onChange={(e) =>
                              setEditingStatusValue(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateStatus(
                                  status.id,
                                  editingStatusValue,
                                );
                              } else if (e.key === "Escape") {
                                setEditingStatusId(null);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(status.id, editingStatusValue)
                            }
                            disabled={saving}
                          >
                            Zapisz
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingStatusId(null)}
                          >
                            Anuluj
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 px-3 py-2 border rounded-md">
                            {status.value}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingStatusId(status.id);
                              setEditingStatusValue(status.value);
                            }}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteStatus(status.id)}
                            disabled={saving}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Issue Types Tab */}
            <TabsContent value="types" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Dodaj nowy typ</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nazwa typu..."
                    value={newTypeValue}
                    onChange={(e) => setNewTypeValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddType()}
                  />
                  <Button
                    onClick={handleAddType}
                    disabled={saving || !newTypeValue.trim()}
                  >
                    {saving ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <PlusIcon />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Istniejące typy</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {issueTypes.map((type) => (
                    <div key={type.id} className="flex gap-2 items-center">
                      {editingTypeId === type.id ? (
                        <>
                          <Input
                            value={editingTypeValue}
                            onChange={(e) =>
                              setEditingTypeValue(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateType(type.id, editingTypeValue);
                              } else if (e.key === "Escape") {
                                setEditingTypeId(null);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateType(type.id, editingTypeValue)
                            }
                            disabled={saving}
                          >
                            Zapisz
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTypeId(null)}
                          >
                            Anuluj
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 px-3 py-2 border rounded-md">
                            {type.value}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTypeId(type.id);
                              setEditingTypeValue(type.value);
                            }}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteType(type.id)}
                            disabled={saving}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Sprints Tab */}
            <TabsContent value="sprints" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Aktualny sprint</h3>
                <div className="flex gap-2">
                  <Select
                    value={currentSprint}
                    onValueChange={setCurrentSprint}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz sprint..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sprints
                        .filter((s) => !s.isArchived)
                        .map((sprint) => (
                          <SelectItem
                            key={sprint.id}
                            value={sprint["@id"] || ""}
                          >
                            {sprint.name} (
                            {sprint.status === "started"
                              ? "Aktywny"
                              : sprint.status === "completed"
                                ? "Zakończony"
                                : "Utworzony"}
                            )
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleChangeCurrentSprint}
                    disabled={saving || !currentSprint}
                  >
                    {saving ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      "Zmień"
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Dodaj nowy sprint</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="sprint-name">Nazwa *</Label>
                    <Input
                      id="sprint-name"
                      placeholder="Nazwa sprintu..."
                      value={newSprintName}
                      onChange={(e) => setNewSprintName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sprint-goal">Cel</Label>
                    <Input
                      id="sprint-goal"
                      placeholder="Cel sprintu..."
                      value={newSprintGoal}
                      onChange={(e) => setNewSprintGoal(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="sprint-start">
                        Data i godzina rozpoczęcia
                      </Label>
                      <Input
                        id="sprint-start"
                        type="datetime-local"
                        min={minDateTime}
                        value={newSprintStartDate}
                        onChange={(e) => setNewSprintStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sprint-end">
                        Data i godzina zakończenia
                      </Label>
                      <Input
                        id="sprint-end"
                        type="datetime-local"
                        min={minDateTime}
                        value={newSprintEndDate}
                        onChange={(e) => setNewSprintEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddSprint}
                    disabled={saving || !newSprintName.trim()}
                    className="w-full"
                  >
                    {saving ? (
                      <Loader2Icon className="animate-spin mr-2" />
                    ) : (
                      <PlusIcon className="mr-2" />
                    )}
                    Dodaj sprint
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Wszystkie sprinty</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {sprints.map((sprint) => (
                    <div
                      key={sprint.id}
                      className={`p-3 border rounded-md ${
                        sprint.status === "started" && !sprint.isArchived
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="font-medium">{sprint.name}</div>
                      {sprint.goal && (
                        <div className="text-sm text-muted-foreground">
                          {sprint.goal}
                        </div>
                      )}
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        <span className="capitalize">
                          Status: {sprint.status}
                        </span>
                        {sprint.startDate && (
                          <span>
                            • Start:{" "}
                            {new Date(sprint.startDate).toLocaleString(
                              "pl-PL",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        )}
                        {sprint.endDate && (
                          <span>
                            • Koniec:{" "}
                            {new Date(sprint.endDate).toLocaleString("pl-PL", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
