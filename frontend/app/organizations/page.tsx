import React from "react";

import { OrganizationsContent } from "@/components/Organization/OrganizationsContent";
import { PageHeader } from "@/components/PageHeader";
import { TopNav } from "@/components/TopNav";
import { apiGet } from "@/services/fetch/api-service";
import type { Collection } from "@/types/api/collection";
import type { Organization } from "@/types/api/organization";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const itemsPerPage = 12;

  const { data: organizations, error } = await apiGet<Collection<Organization>>(
    `/organizations?page=${page}&itemsPerPage=${itemsPerPage}`,
  );

  if (error) {
    console.error("Failed to load organizations:", error);
  }

  return (
    <>
      <TopNav />
      <div className="p-4 grid gap-4">
        <PageHeader title="Organizacje" />
        <OrganizationsContent
          organizations={organizations?.member || []}
          totalItems={organizations?.totalItems || 0}
          currentPage={page}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </>
  );
}
