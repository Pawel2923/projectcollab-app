"use client";

import { XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import { FilterIcon } from "@/assets/icons/FilterIcon";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Collection } from "@/lib/types/api";
import { isOk } from "@/lib/types/result";
import { clientApiGet } from "@/lib/utils/clientApiClient";
import { useIssuesOptions } from "@/store/IssuesOptionsContext";

type IssueStatusEntity = {
  "@id": string;
  id: number;
  value: string;
};

type IssueTypeEntity = {
  "@id": string;
  id: number;
  value: string;
};

type ResolutionEntity = {
  "@id": string;
  id: number;
  value: string;
};

export function Filter({ projectId }: { projectId?: string | number }) {
  const [isOpen, setIsOpen] = useState(false);
  const issuesOptions = useIssuesOptions();

  // Local state for the current filter being configured
  const [filterField, setFilterField] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [filterOperator, setFilterOperator] = useState<
    "exact" | "partial" | "before" | "after" | "gt" | "lt" | "gte" | "lte"
  >("exact");

  // Local draft of filters (not applied until user clicks Apply)
  type IssueFilterOption = {
    field: string;
    value: string | string[];
    operator?:
      | "exact"
      | "partial"
      | "before"
      | "after"
      | "gt"
      | "lt"
      | "gte"
      | "lte";
  };
  const [draftFilters, setDraftFilters] = useState<IssueFilterOption[]>([]);

  // State for fetched entity values
  const [issueStatuses, setIssueStatuses] = useState<IssueStatusEntity[]>([]);
  const [issueTypes, setIssueTypes] = useState<IssueTypeEntity[]>([]);
  const [resolutions, setResolutions] = useState<ResolutionEntity[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);

  // Fetch entity values when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchEntities = async () => {
      setIsLoadingEntities(true);
      const urlParams = projectId ? `?project=${projectId}` : "";
      try {
        const [statusesRes, typesRes, resolutionsRes] = await Promise.all([
          clientApiGet<Collection<IssueStatusEntity>>(
            `/issue_statuses${urlParams}`,
          ),
          clientApiGet<Collection<IssueTypeEntity>>(`/issue_types${urlParams}`),
          clientApiGet<Collection<ResolutionEntity>>(
            `/resolutions${urlParams}`,
          ),
        ]);

        const statusesData =
          statusesRes && isOk(statusesRes) ? statusesRes.value : null;
        const typesData = typesRes && isOk(typesRes) ? typesRes.value : null;
        const resolutionsData =
          resolutionsRes && isOk(resolutionsRes) ? resolutionsRes.value : null;

        if (statusesData) setIssueStatuses(statusesData.member || []);
        if (typesData) setIssueTypes(typesData.member || []);
        if (resolutionsData) setResolutions(resolutionsData.member || []);
      } catch (error) {
        console.error("Failed to fetch filter entities:", error);
      } finally {
        setIsLoadingEntities(false);
      }
    };

    fetchEntities();
  }, [isOpen, projectId]);

  if (!issuesOptions) {
    console.error("Filter: issuesOptions context is not available");
    return null;
  }

  const { filterOptions, setFilterOptions } = issuesOptions;

  // Field type definitions
  const fieldTypes: Record<
    string,
    {
      type: "text" | "number" | "date" | "select";
      operators: Array<
        "exact" | "partial" | "before" | "after" | "gt" | "lt" | "gte" | "lte"
      >;
      options?: Array<{ value: string; label: string }>;
    }
  > = {
    title: { type: "text", operators: ["exact", "partial"] },
    description: { type: "text", operators: ["exact", "partial"] },
    priority: {
      type: "select",
      operators: ["exact"],
      options: [
        { value: "low", label: "Niski" },
        { value: "medium", label: "Średni" },
        { value: "high", label: "Wysoki" },
        { value: "critical", label: "Krytyczny" },
      ],
    },
    status: {
      type: "select",
      operators: ["exact"],
      options: [], // Will be populated dynamically
    },
    type: {
      type: "select",
      operators: ["exact"],
      options: [], // Will be populated dynamically
    },
    resolution: {
      type: "select",
      operators: ["exact"],
      options: [], // Will be populated dynamically
    },
    assignees: { type: "text", operators: ["exact", "partial"] },
    reporter: { type: "text", operators: ["exact", "partial"] },
    endDate: { type: "date", operators: ["exact", "before", "after"] },
    estimated: {
      type: "text",
      operators: ["exact", "gt", "lt", "gte", "lte"],
    },
  };

  // Get available operators for current field
  const availableOperators = filterField
    ? fieldTypes[filterField]?.operators || ["exact"]
    : ["exact"];

  // Get field configuration with dynamic options
  const getCurrentFieldConfig = () => {
    if (!filterField) return null;

    const config = fieldTypes[filterField];
    if (!config) return null;

    // Add dynamic options for entity-based fields
    if (filterField === "status") {
      return {
        ...config,
        options: issueStatuses.map((status) => ({
          value: status["@id"],
          label: status.value,
        })),
      };
    }

    if (filterField === "type") {
      return {
        ...config,
        options: issueTypes.map((type) => ({
          value: type["@id"],
          label: type.value,
        })),
      };
    }

    if (filterField === "resolution") {
      return {
        ...config,
        options: resolutions.map((resolution) => ({
          value: resolution["@id"],
          label: resolution.value,
        })),
      };
    }

    return config;
  };

  const currentFieldConfig = getCurrentFieldConfig();

  // Sync draft filters when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setDraftFilters(filterOptions);
    }
  };

  // Reset operator when field changes
  const handleFieldChange = (value: string) => {
    setFilterField(value);
    setFilterValue("");
    // Set default operator based on field type
    const defaultOperator = fieldTypes[value]?.operators[0] || "exact";
    setFilterOperator(defaultOperator);
  };

  const handleAddFilter = () => {
    if (!filterField || !filterValue) return;

    const newFilterOption = {
      field: filterField,
      value: filterValue,
      operator: filterOperator,
    };
    console.log("Adding filter:", newFilterOption);

    const existingIndex = draftFilters.findIndex(
      (opt) => opt.field === filterField,
    );

    if (existingIndex >= 0) {
      // Update existing filter
      const updated = [...draftFilters];
      updated[existingIndex] = newFilterOption;
      setDraftFilters(updated);
      console.log("Updated existing filter at index", existingIndex);
    } else {
      // Add new filter
      setDraftFilters([...draftFilters, newFilterOption]);
      console.log("Added new filter");
    }

    // Reset local state after adding
    setFilterField("");
    setFilterValue("");
    setFilterOperator("exact");
  };

  const handleApplyFilters = () => {
    console.log("handleApplyFilters called with draftFilters:", draftFilters);
    setFilterOptions(draftFilters);
    console.log("Filters applied to context");
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setDraftFilters([]);
    setFilterField("");
    setFilterValue("");
    setFilterOperator("exact");
  };
  const handleRemoveFilter = (index: number) => {
    setDraftFilters(draftFilters.filter((_, i) => i !== index));
  };

  const getOperatorLabel = (operator: string): string => {
    const labels: Record<string, string> = {
      exact: "Dokładnie",
      partial: "Zawiera",
      before: "Przed",
      after: "Po",
      gt: "Większe niż",
      lt: "Mniejsze niż",
      gte: "Większe lub równe",
      lte: "Mniejsze lub równe",
    };
    return labels[operator] || operator;
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      title: "Tytuł",
      description: "Opis",
      priority: "Priorytet",
      status: "Status",
      type: "Typ",
      resolution: "Rozwiązanie",
      assignees: "Przypisani",
      reporter: "Zgłaszający",
      endDate: "Termin",
      estimated: "Czas szacowany",
    };
    return labels[field] || field;
  };

  const getValueLabel = (field: string, value: string | string[]): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    // Translate priority values
    if (field === "priority") {
      const priorityLabels: Record<string, string> = {
        low: "Niski",
        medium: "Średni",
        high: "Wysoki",
        critical: "Krytyczny",
      };
      return priorityLabels[value] || value;
    }

    // Translate IRI values to human-readable labels
    if (field === "status") {
      const status = issueStatuses.find((s) => s["@id"] === value);
      return status?.value || value;
    }

    if (field === "type") {
      const type = issueTypes.find((t) => t["@id"] === value);
      return type?.value || value;
    }

    if (field === "resolution") {
      const resolution = resolutions.find((r) => r["@id"] === value);
      return resolution?.value || value;
    }

    return value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <FilterIcon />
          Filtruj
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Filtrowanie zadań</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Display current draft filter options */}
          {draftFilters.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-disabled">Aktywne filtry:</p>
              {draftFilters.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 bg-tertiary rounded-lg"
                >
                  <span className="text-sm">
                    {getFieldLabel(option.field)} -{" "}
                    {getOperatorLabel(option.operator || "exact")}:{" "}
                    {getValueLabel(option.field, option.value)}
                  </span>
                  <button
                    onClick={() => handleRemoveFilter(index)}
                    className="text-destructive hover:brightness-90 transition-all duration-300"
                    aria-label="Usuń filtr"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-2 block">Pole</label>
              <Select value={filterField} onValueChange={handleFieldChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz pole" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Tytuł</SelectItem>
                  <SelectItem value="description">Opis</SelectItem>
                  <SelectItem value="priority">Priorytet</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="type">Typ</SelectItem>
                  <SelectItem value="resolution">Rozwiązanie</SelectItem>
                  <SelectItem value="assignees">Przypisani</SelectItem>
                  <SelectItem value="reporter">Zgłaszający</SelectItem>
                  <SelectItem value="endDate">Termin</SelectItem>
                  <SelectItem value="estimated">
                    Czas szacowany (w/d/h/m)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterField && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Operator
                </label>
                <Select
                  value={filterOperator}
                  onValueChange={(value) =>
                    setFilterOperator(
                      value as
                        | "exact"
                        | "partial"
                        | "before"
                        | "after"
                        | "gt"
                        | "lt"
                        | "gte"
                        | "lte",
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOperators.map((op) => (
                      <SelectItem key={op} value={op}>
                        {getOperatorLabel(op)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filterField && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Wartość
                </label>
                {currentFieldConfig?.type === "select" ? (
                  <Select
                    value={filterValue}
                    onValueChange={setFilterValue}
                    disabled={isLoadingEntities}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingEntities ? "Ładowanie..." : "Wybierz wartość"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {currentFieldConfig.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : currentFieldConfig?.type === "date" ? (
                  <Input
                    type="date"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && filterField && filterValue) {
                        e.preventDefault();
                        handleAddFilter();
                      }
                    }}
                  />
                ) : currentFieldConfig?.type === "number" ? (
                  <Input
                    type="number"
                    placeholder="Wprowadź liczbę"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && filterField && filterValue) {
                        e.preventDefault();
                        handleAddFilter();
                      }
                    }}
                  />
                ) : (
                  <Input
                    type="text"
                    placeholder="Wprowadź wartość"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && filterField && filterValue) {
                        e.preventDefault();
                        handleAddFilter();
                      }
                    }}
                  />
                )}
              </div>
            )}

            {filterField && (
              <div className="col-span-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAddFilter}
                  disabled={!filterField || !filterValue}
                >
                  Dodaj filtr
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {draftFilters.length > 0 && (
            <Button variant="outline" onClick={handleResetFilters}>
              <XIcon className="w-4 h-4 mr-2" />
              Resetuj filtry
            </Button>
          )}
          <Button onClick={handleApplyFilters}>Zastosuj filtry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
