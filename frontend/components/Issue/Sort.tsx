"use client";

import { XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import { SortIcon } from "@/assets/icons/SortIcon";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIssuesOptions } from "@/store/IssuesOptionsContext";

export function Sort() {
  const [isOpen, setIsOpen] = useState(false);
  const issuesOptions = useIssuesOptions();

  // Local state for the current sort option being configured
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");

  // Automatically add/update sort when both values are selected
  useEffect(() => {
    if (!issuesOptions || !sortBy || !sortOrder) return;

    const { sortOptions, setSortOptions } = issuesOptions;
    const newSortOption = { sortBy, sortOrder: sortOrder as "asc" | "desc" };
    const existingIndex = sortOptions.findIndex((opt) => opt.sortBy === sortBy);

    if (existingIndex >= 0) {
      // Update existing sort option
      const updated = [...sortOptions];
      updated[existingIndex] = newSortOption;
      setSortOptions(updated);
    } else {
      // Add new sort option
      setSortOptions([...sortOptions, newSortOption]);
    }

    // Reset local state after adding
    setSortBy("");
    setSortOrder("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  if (!issuesOptions) {
    return null;
  }

  const { sortOptions, setSortOptions } = issuesOptions;

  const handleResetSort = () => {
    setSortOptions([]);
    setSortBy("");
    setSortOrder("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary">
          <SortIcon />
          Sortuj
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="flex flex-col gap-4 min-w-96 w-96"
        sideOffset={8}
        align="start"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-medium text-lg">Sortowanie</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-accent transition-colors"
            aria-label="Zamknij"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M9 3L3 9M3 3L9 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Display current sort options */}
        {sortOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-disabled">Aktywne sortowania:</p>
            {sortOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-tertiary rounded-lg"
              >
                <span className="text-sm">
                  {getSortFieldLabel(option.sortBy)} -{" "}
                  {option.sortOrder === "asc" ? "Rosnąco" : "Malejąco"}
                </span>
                <button
                  onClick={() => {
                    setSortOptions(sortOptions.filter((_, i) => i !== index));
                  }}
                  className="text-destructive hover:brightness-90 transition-all duration-300"
                  aria-label="Usuń sortowanie"
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sortuj według" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Tytuł</SelectItem>
                <SelectItem value="endDate">Termin wykonania</SelectItem>
                <SelectItem value="priority">Priorytet</SelectItem>
                <SelectItem value="createdAt">Data utworzenia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kierunek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Rosnąco</SelectItem>
                <SelectItem value="desc">Malejąco</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {sortOptions.length > 0 && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleResetSort}
          >
            <XIcon />
            Resetuj sortowanie
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

function getSortFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    title: "Tytuł",
    endDate: "Termin wykonania",
    priority: "Priorytet",
    createdAt: "Data utworzenia",
  };
  return labels[field] || field;
}
