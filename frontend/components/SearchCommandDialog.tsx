"use client";

import { type DialogProps } from "@radix-ui/react-dialog";
import {
  Building2,
  CircleDot,
  Folder,
  MessageSquare,
  Search,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { searchGlobal, type SearchResults } from "@/actions/search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/useDebounce";

export function SearchCommandDialog({ open, onOpenChange }: DialogProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = React.useState<SearchResults | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!debouncedQuery) {
      setResults(null);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchGlobal(debouncedQuery);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSelect = (url: string) => {
    router.push(url);
    onOpenChange?.(false);
  };

  const hasResults =
    results &&
    (results.issues.length > 0 ||
      results.projects.length > 0 ||
      results.organizations.length > 0 ||
      results.chats.length > 0 ||
      results.users.length > 0);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Wpisz komendę lub szukaj..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Szukanie...
          </div>
        )}

        {!loading && !hasResults && debouncedQuery && (
          <CommandEmpty>Brak wyników.</CommandEmpty>
        )}

        {!loading && results && (
          <>
            {results.issues.length > 0 && (
              <CommandGroup heading="Zadania">
                {results.issues.map((issue) => (
                  <CommandItem
                    key={`issue-${issue.id}`}
                    value={`issue-${issue.id}-${issue.title}`}
                    onSelect={() =>
                      handleSelect(
                        `/organizations/${issue.organizationId}/projects/${issue.projectId}/issues/${issue.id}`,
                      )
                    }
                  >
                    <CircleDot className="mr-2 h-4 w-4" />
                    <span>
                      {issue.key} - {issue.title}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {issue.projectName}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.projects.length > 0 && (
              <CommandGroup heading="Projekty">
                {results.projects.map((project) => (
                  <CommandItem
                    key={`project-${project.id}`}
                    value={`project-${project.id}-${project.name}`}
                    onSelect={() =>
                      handleSelect(
                        `/organizations/${project.organizationId}/projects/${project.id}`,
                      )
                    }
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    <span>{project.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {project.organizationName}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.organizations.length > 0 && (
              <CommandGroup heading="Organizacje">
                {results.organizations.map((org) => (
                  <CommandItem
                    key={`org-${org.id}`}
                    value={`org-${org.id}-${org.name}`}
                    onSelect={() =>
                      handleSelect(`/organizations/${org.id}/overview`)
                    }
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>{org.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.chats.length > 0 && (
              <CommandGroup heading="Czaty">
                {results.chats.map((chat) => (
                  <CommandItem
                    key={`chat-${chat.id}`}
                    value={`chat-${chat.id}-${chat.name}`}
                    onSelect={() =>
                      handleSelect(
                        `/organizations/${chat.organizationId}/chats/${chat.id}`,
                      )
                    }
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>{chat.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {chat.organizationName}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.users.length > 0 && (
              <CommandGroup heading="Użytkownicy">
                {results.users.map((user) => (
                  <CommandItem
                    key={`user-${user.id}`}
                    value={`user-${user.id}-${user.username}`}
                    onSelect={() => {
                      // Users might not have a direct page yet, or maybe profile?
                      // For now, let's just search for them in the search page
                      handleSelect(
                        `/search?q=${encodeURIComponent(user.username)}`,
                      );
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{user.username}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Ogólne">
          {query && (
            <CommandItem
              value="search-page"
              onSelect={() =>
                handleSelect(`/search?q=${encodeURIComponent(query)}`)
              }
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Zobacz wszystkie wyniki dla &quot;{query}&quot;</span>
            </CommandItem>
          )}
          {!query && (
            <CommandItem
              value="search-page-empty"
              onSelect={() => handleSelect(`/search`)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Przejdź do strony wyszukiwania</span>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
