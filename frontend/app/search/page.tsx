import {
  Building2,
  CircleDot,
  Folder,
  MessageSquare,
  User,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { searchGlobal } from "@/actions/search/search";
import { PageHeader } from "@/components/PageHeader";
import { SearchBackButton } from "@/components/SearchBackButton";
import { SearchPageInput } from "@/components/SearchPageInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const results = await searchGlobal(query);

  if (!query) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <SearchBackButton />
        <div className="mt-8">
          <PageHeader
            title="Wyszukiwanie"
            description="Wpisz frazę, aby znaleźć zadania, projekty i inne."
          />
          <div className="mt-4">
            <SearchPageInput />
          </div>
        </div>
      </div>
    );
  }

  const hasResults =
    results.issues.length > 0 ||
    results.projects.length > 0 ||
    results.organizations.length > 0 ||
    results.chats.length > 0 ||
    results.users.length > 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <SearchBackButton />
      <div className="mb-8">
        <PageHeader title="Wyszukiwanie" />
        <div className="mt-4">
          <SearchPageInput initialQuery={query} />
        </div>
        <p className="text-muted-foreground mt-4">
          Znaleziono wyniki dla &quot;{query}&quot;
        </p>
      </div>

      {!hasResults && (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">Brak wyników.</p>
        </div>
      )}

      <div className="space-y-10">
        {/* Issues */}
        {results.issues.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CircleDot className="h-5 w-5" /> Zadania
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.issues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/organizations/${issue.organizationId}/projects/${issue.projectId}/issues/${issue.id}`}
                  className="block h-full"
                >
                  <Card className="h-full hover:bg-muted/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-base flex items-start justify-between gap-2">
                        <span className="truncate">{issue.title}</span>
                        <span className="text-xs font-normal text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
                          {issue.key}
                        </span>
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {issue.projectName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Typ: {issue.type}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {results.projects.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Folder className="h-5 w-5" /> Projekty
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/organizations/${project.organizationId}/projects/${project.id}`}
                  className="block h-full"
                >
                  <Card className="h-full hover:bg-muted/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {project.name}
                      </CardTitle>
                      <CardDescription>
                        {project.organizationName}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Organizations */}
        {results.organizations.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Organizacje
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.organizations.map((org) => (
                <Link
                  key={org.id}
                  href={`/organizations/${org.id}/overview`}
                  className="block h-full"
                >
                  <Card className="h-full hover:bg-muted/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-base">{org.name}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Chats */}
        {results.chats.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Czaty
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/organizations/${chat.organizationId}/chats/${chat.id}`}
                  className="block h-full"
                >
                  <Card className="h-full hover:bg-muted/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-base">{chat.name}</CardTitle>
                      <CardDescription>{chat.organizationName}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Users */}
        {results.users.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" /> Użytkownicy
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.users.map((user) => (
                <Card key={user.id} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">{user.username}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
