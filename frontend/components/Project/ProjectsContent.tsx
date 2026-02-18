"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";

import { CreateProjectForm } from "@/components/Organization/CreateProjectForm";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import type { Project } from "@/types/api/project";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ProjectCard } from "./ProjectCard";

interface ProjectsContentProps {
  projects: Project[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  organizationId: string;
}

export function ProjectsContent({
  projects,
  totalItems,
  currentPage,
  itemsPerPage,
  organizationId,
}: ProjectsContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useMercureObserver({
    topics: ["/projects"],
  });

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;

    const query = searchQuery.toLowerCase();
    return projects.filter((project) =>
      project.name.toLowerCase().includes(query),
    );
  }, [projects, searchQuery]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const showPagination = totalItems > itemsPerPage;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(
      `/organizations/${organizationId}/projects?${params.toString()}`,
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj projektów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {filteredProjects.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  iri={project["@id"]}
                  name={project.name}
                  organizationId={organizationId}
                />
              ))}
            </div>

            {showPagination && !searchQuery && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Strona {currentPage} z {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Poprzednia
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Następna
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {searchQuery ? (
              <p>
                Nie znaleziono projektów pasujących do &quot;{searchQuery}&quot;
              </p>
            ) : (
              <>
                <p>Nie znaleziono projektów.</p>
                <p className="text-sm mt-2">
                  Utwórz swój pierwszy projekt, aby zacząć!
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <CreateProjectForm organizationId={organizationId} />
      </div>
    </div>
  );
}
