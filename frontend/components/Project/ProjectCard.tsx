"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { useErrorHandler } from "@/hooks/useErrorHandler";
import { apiGet } from "@/services/fetch/api-service";
import type { ProjectMember } from "@/types/api/project";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ProjectCardMenu } from "./ProjectCardMenu";

interface ProjectCardProps {
  id: number;
  iri: string;
  name: string;
  organizationId: string;
}

export function ProjectCard({
  id,
  iri,
  name,
  organizationId,
}: ProjectCardProps) {
  const [memberCount, setMemberCount] = useState<number>(0);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useErrorHandler();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await apiGet<{
          totalItems: number;
          member: ProjectMember[];
        }>(`/project_members?projectId=${id}&pagination=false`);
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
    <Card>
      <CardHeader>
        <Link href={`/organizations/${organizationId}/projects/${id}/summary`}>
          <CardTitle className="text-xl hover:text-primary transition-colors">
            {name}
          </CardTitle>
        </Link>
        <CardDescription>Projekt</CardDescription>
        <CardAction>
          <ProjectCardMenu
            organizationId={organizationId}
            projectId={id.toString()}
            projectIri={iri}
            existingMembers={members}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
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
