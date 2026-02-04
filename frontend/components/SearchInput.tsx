import React from "react";

import { SearchIcon } from "@/assets/icons/SearchIcon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchIconClick?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  containerClassName?: string;
  ariaLabel?: string;
}

export function SearchInput({
  placeholder = "Wyszukaj coś",
  name = "mainSearch",
  className = "",
  onSearchIconClick,
  inputRef,
  id = "main-search-input",
  ariaLabel = "Wyszukiwanie w projekcie",
  containerClassName = "",
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <SearchIcon
        className="absolute left-4 top-1/2 -translate-y-1/2 cursor-text h-4 w-4 text-muted-foreground"
        onClick={onSearchIconClick}
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder={placeholder}
        name={name}
        id={id}
        aria-label={ariaLabel}
        className={cn("pl-11 rounded-full bg-background h-10", className)}
        ref={inputRef}
        {...props}
      />
    </div>
  );
}
