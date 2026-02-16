import { Check, ChevronsUpDown } from "lucide-react";
import React, { useState } from "react";

import { classNamesMerger } from "@/utils/class-names-merger";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface ComboBoxItem {
  label: string | React.ReactNode;
  value: string;
  className?: string;
}

interface ComboBoxProps {
  title: string;
  items: ComboBoxItem[];
  placeholder: string;
  emptyMessage?: string;
  onSelect?: (value: string) => void;
}

export function ComboBox({
  title,
  items,
  placeholder,
  emptyMessage,
  onSelect,
  selectedValues,
}: ComboBoxProps & { selectedValues?: string[] }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const isMultiSelect = selectedValues !== undefined;

  const selectHandler = (currentValue: string) => {
    if (isMultiSelect) {
      onSelect?.(currentValue);
      // Keep open for multiple selections
    } else {
      setValue(currentValue === value ? "" : currentValue);
      setOpen(false);
      onSelect?.(currentValue);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          aria-controls="combobox-content"
          className={classNamesMerger(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            (isMultiSelect
              ? (selectedValues?.length ?? 0) === 0
              : value === "") && "text-muted-foreground",
          )}
        >
          {isMultiSelect
            ? title
            : value
              ? items.find((item) => item.value === value)?.label
              : title}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command id="combobox-content">
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>
              {emptyMessage || "Brak dostępnych opcji."}
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={selectHandler}
                  className={item.className}
                >
                  {item.label}
                  <Check
                    className={classNamesMerger(
                      "ml-auto",
                      isMultiSelect
                        ? selectedValues.includes(item.value)
                          ? "opacity-100"
                          : "opacity-0"
                        : value === item.value
                          ? "opacity-100"
                          : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
