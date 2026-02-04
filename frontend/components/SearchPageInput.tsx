"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { SearchInput } from "@/components/SearchInput";

export function SearchPageInput({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Szukaj zadań, projektów, organizacji..."
        className="w-full"
        autoFocus
      />
    </form>
  );
}
