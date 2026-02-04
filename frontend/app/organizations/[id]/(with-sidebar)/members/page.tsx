import { redirect } from "next/navigation";
import React from "react";

import MembersPageContent from "@/components/Organization/MembersPageContent";
import { PageHeader } from "@/components/PageHeader";
import { getCurrentUser } from "@/lib/services/userService";
import type { Collection, OrganizationMember } from "@/lib/types/api";
import { apiGet } from "@/lib/utils/apiClient";
import { hasPermission } from "@/lib/utils/permissions";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MembersPage({ params }: PageProps) {
  const { id } = await params;
  const userResult = await getCurrentUser();

  if (!userResult.ok) {
    redirect(`/signin?callbackUrl=/organizations/${id}/members`);
  }

  const user = userResult.value;

  const membershipResult = await apiGet<Collection<OrganizationMember>>(
    `/organization_members?organizationId=${id}&member.id=${user.id}`,
  );

  if (membershipResult.error || !membershipResult.data?.member?.[0]) {
    redirect(`/organizations/${id}/overview`);
  }

  const userMembership = membershipResult.data.member[0];
  const userRole = userMembership.role.value as "CREATOR" | "ADMIN" | "MEMBER";

  if (!hasPermission(userRole, "ADMIN")) {
    redirect(`/organizations/${id}/overview`);
  }

  const membersResult = await apiGet<Collection<OrganizationMember>>(
    `/organization_members?organizationId=${id}`,
  );

  if (membersResult.error) {
    redirect(`/organizations/${id}/overview`);
  }

  const members = membersResult.data?.member || [];

  return (
    <div className="p-4 space-y-6">
      <PageHeader
        title="Członkowie"
        description="Zarządzaj rolami i uprawnieniami członków"
      />
      <MembersPageContent
        initialMembers={members}
        currentUserId={user.id}
        organizationId={id}
      />
    </div>
  );
}
