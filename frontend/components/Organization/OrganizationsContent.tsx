"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";

import { useMercureObserver } from "@/hooks/useMercureObserver";
import type { Organization } from "@/types/api/organization";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CreateOrganizationForm } from "./CreateOrganizationForm";
import { OrganizationCard } from "./OrganizationCard";

interface OrganizationsContentProps {
  organizations: Organization[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}

export function OrganizationsContent({
  organizations,
  totalItems,
  currentPage,
  itemsPerPage,
}: OrganizationsContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useMercureObserver({
    topics: ["/organizations"],
  });

  // Filter organizations by search query (client-side)
  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) return organizations;

    const query = searchQuery.toLowerCase();
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(query),
    );
  }, [organizations, searchQuery]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const showPagination = totalItems > itemsPerPage;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/organizations?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj organizacji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {filteredOrganizations.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredOrganizations.map((org) => (
                    <OrganizationCard
                      key={org.id}
                      id={org.id}
                      iri={org["@id"]}
                      name={org.name}
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
                    Nie znaleziono organizacji pasujących do &quot;{searchQuery}
                    &quot;
                  </p>
                ) : (
                  <>
                    <p>Nie znaleziono organizacji.</p>
                    <p className="text-sm mt-2">
                      Utwórz swoją pierwszą organizację, aby zacząć!
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start">
            <CreateOrganizationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
