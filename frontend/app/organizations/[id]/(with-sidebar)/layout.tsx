import type { Metadata } from "next";
import { cookies } from "next/headers";
import React from "react";

import { OrganizationSideNav } from "@/components/Organization/OrganizationSideNav";
import { TopNav } from "@/components/TopNav";
import { apiGet } from "@/services/fetch/api-service";
import { OrganizationProvider } from "@/store/OrganizationContext";
import type { Organization } from "@/types/api/organization";
import { generateAcronym } from "@/utils/acronym-generator";

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

  // Fetch organization details
  const organizationResult = await apiGet<Organization>(`/organizations/${id}`);
  const organization = organizationResult.data;

  // Get sidebar expanded state from cookies
  const cookieStore = await cookies();
  const isSideNavExpandedCookie = cookieStore.get("pc_side_nav_expanded");

  let isSideNavExpanded: boolean;
  try {
    isSideNavExpanded = JSON.parse(isSideNavExpandedCookie?.value || "true");
  } catch {
    isSideNavExpanded = true;
  }

  return (
    <OrganizationProvider organizationId={id}>
      <div className="grid grid-rows-[auto_auto_1fr] md:grid-rows-[auto_1fr] grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
        <TopNav organizationId={id} />
        <OrganizationSideNav
          organizationId={id}
          organizationName={organization?.name}
          organizationAcronym={
            organization?.name ? generateAcronym(organization.name) : undefined
          }
          isSideNavExpanded={isSideNavExpanded}
        />
        <main className="col-start-1 row-start-3 overflow-y-auto md:col-start-2 md:row-start-2">
          {children}
        </main>
      </div>
    </OrganizationProvider>
  );
}
