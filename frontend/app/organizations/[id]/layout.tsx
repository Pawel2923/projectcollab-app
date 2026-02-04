import type { Metadata } from "next";
import React from "react";

import type { Organization } from "@/lib/types/api";
import { apiGet } from "@/lib/utils/apiClient";
import { OrganizationProvider } from "@/store/OrganizationContext";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const organization = await apiGet<Organization>(`/organizations/${id}`);
  const organizationName = organization.data
    ? ` ${organization.data?.name}`
    : "";

  return {
    title: `Organizacja${organizationName} - ProjectCollab`,
  };
}

export default async function OrganizationLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <OrganizationProvider organizationId={id}>{children}</OrganizationProvider>
  );
}
