import React from "react";

import { UpdateOrganizationNameForm } from "@/components/Organization/UpdateOrganizationNameForm";
import { PageHeader } from "@/components/PageHeader";
import { apiGet } from "@/services/fetch/api-service";
import type { Organization } from "@/types/api/organization";

export default async function OrganizationSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: organizationId } = await params;

  const organization = await apiGet<Organization>(
    `/organizations/${organizationId}`,
  );
  const organizationName = organization.data
    ? ` ${organization.data?.name}`
    : "";

  return (
    <div className="p-4 space-y-6">
      <PageHeader
        title="Ustawienia"
        description="Zmień ustawienia organizacji"
      />
      <UpdateOrganizationNameForm
        organizationId={organizationId}
        currentName={organizationName}
      />
    </div>
  );
}
