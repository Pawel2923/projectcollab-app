"use client";

import React, { useEffect, useState } from "react";

import { SearchCommandDialog } from "./SearchCommandDialog";
import { SearchInput } from "./SearchInput";

export function InteractiveSearchInput() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div onClick={() => setOpen(true)}>
        <SearchInput
          placeholder="Szukaj... (Ctrl+K)"
          readOnly
          className="cursor-pointer"
        />
      </div>
      <SearchCommandDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
