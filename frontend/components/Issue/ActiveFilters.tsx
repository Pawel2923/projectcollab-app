"use client";

import { XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import { clientApiGet } from "@/services/fetch/client-api-service";
import { useIssuesOptions } from "@/store/IssuesOptionsContext";
import type { Collection } from "@/types/api/collection";
import type {
  IssueResolution,
  IssueStatus,
  IssueType,
} from "@/types/api/issue";
import { isOk } from "@/utils/result";

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

const getOperatorLabel = (
  operator?:
    | "exact"
    | "partial"
    | "before"
    | "after"
    | "gt"
    | "lt"
    | "gte"
    | "lte",
): string => {
  const labels: Record<string, string> = {
    exact: "dokładnie",
    partial: "zawiera",
    before: "przed",
    after: "po",
    gt: ">",
    lt: "<",
    gte: "≥",
    lte: "≤",
  };
  return operator ? labels[operator] : "";
};

const getSortOrderLabel = (order: "asc" | "desc"): string => {
  return order === "asc" ? "rosnąco" : "malejąco";
};

const getValueLabel = (field: string, value: string | string[]): string => {
  // Handle array values
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

  // Add more field-specific value translations here if needed
  return value;
};

const getValueLabelFromEntities = (
  field: string,
  value: string | string[],
  issueStatuses: IssueStatus[],
  issueTypes: IssueType[],
  resolutions: IssueResolution[],
): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  // For IRI values, look up the label
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

  // Use the basic value label function for other fields
  return getValueLabel(field, value);
};

export function ActiveFilters() {
  const issuesOptions = useIssuesOptions();

  // State for entity lookups
  const [issueStatuses, setIssueStatuses] = useState<IssueStatus[]>([]);
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [resolutions, setResolutions] = useState<IssueResolution[]>([]);

  // Fetch entities once when component mounts
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [statusesRes, typesRes, resolutionsRes] = await Promise.all([
          clientApiGet<Collection<IssueStatus>>("/issue_statuses"),
          clientApiGet<Collection<IssueType>>("/issue_types"),
          clientApiGet<Collection<IssueResolution>>("/resolutions"),
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
      }
    };

    fetchEntities();
  }, []);

  if (!issuesOptions) {
    return null;
  }

  const { filterOptions, setFilterOptions, sortOptions, setSortOptions } =
    issuesOptions;

  const hasActiveFilters = filterOptions.length > 0 || sortOptions.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  const handleRemoveFilter = (index: number) => {
    setFilterOptions(filterOptions.filter((_, i) => i !== index));
  };

  const handleRemoveSort = (index: number) => {
    setSortOptions(sortOptions.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFilterOptions([]);
    setSortOptions([]);
  };

  const totalActiveItems = filterOptions.length + sortOptions.length;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Clear All button - shown when there are multiple items */}
      {totalActiveItems > 1 && (
        <button
          onClick={handleClearAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg text-sm font-medium transition-colors border border-destructive/20"
          aria-label="Wyczyść wszystko"
        >
          <XIcon className="w-3.5 h-3.5" />
          Wyczyść wszystko ({totalActiveItems})
        </button>
      )}

      {/* Display active sorts */}
      {sortOptions.map((option, index) => (
        <div
          key={`sort-${index}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm border border-border"
        >
          <span className="font-medium">
            {getFieldLabel(option.sortBy)}{" "}
            <span className="text-muted-foreground">
              {getSortOrderLabel(option.sortOrder)}
            </span>
          </span>
          <button
            onClick={() => handleRemoveSort(index)}
            className="hover:text-destructive transition-colors"
            aria-label="Usuń sortowanie"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Display active filters */}
      {filterOptions.map((option, index) => (
        <div
          key={`filter-${index}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm border border-border"
        >
          <span className="font-medium">
            {getFieldLabel(option.field)}{" "}
            <span className="text-muted-foreground">
              {option.operator && getOperatorLabel(option.operator)}
            </span>{" "}
            <span className="text-foreground">
              {getValueLabelFromEntities(
                option.field,
                option.value,
                issueStatuses,
                issueTypes,
                resolutions,
              )}
            </span>
          </span>
          <button
            onClick={() => handleRemoveFilter(index)}
            className="hover:text-destructive transition-colors"
            aria-label="Usuń filtr"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
