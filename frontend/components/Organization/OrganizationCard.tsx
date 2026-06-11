"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { useErrorHandler } from "@/hooks/useErrorHandler";
import { apiGet } from "@/services/fetch/api-service";
import type { OrganizationMember } from "@/types/api/organization";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { OrganizationCardMenu } from "./OrganizationCardMenu";

interface OrganizationCardProps {
  id: number;
  iri: string;
  name: string;
}

export function OrganizationCard({ id, iri, name }: OrganizationCardProps) {
  const [memberCount, setMemberCount] = useState<number>(0);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useErrorHandler();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await apiGet<{
          totalItems: number;
          member: OrganizationMember[];
        }>(`/organization_members?organizationId=${id}&pagination=false`);
        setMemberCount(response.data?.totalItems || 0);
        setMembers(response.data?.member || []);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [id, showError]);

  return (
    <Card className="relative hover:bg-light-hover transition-colors">
      <Link
        aria-label={`Otwórz organizację ${name}`}
        className="absolute inset-0 z-10 rounded-xl"
        href={`/organizations/${id}/overview`}
      />
      <CardHeader className="pointer-events-none relative">
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>Organizacja</CardDescription>
        <CardAction className="pointer-events-auto relative z-20">
          <OrganizationCardMenu
            organizationId={id.toString()}
            organizationIri={iri}
            existingMembers={members}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="pointer-events-none relative z-0 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {isLoading
              ? "..."
              : `${memberCount} ${memberCount === 1 ? "członek" : "członków"}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
