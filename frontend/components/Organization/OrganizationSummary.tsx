"use client";

import { ArrowRight, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

import { ProjectCard } from "@/components/Project/ProjectCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Chat } from "@/types/api/chat";
import type { Organization } from "@/types/api/organization";
import type { Project } from "@/types/api/project";
import { formatDistanceToNow } from "@/utils/date-utils";

interface OrganizationSummaryProps {
  organization: Organization;
  recentProjects: Project[];
  recentChats: Chat[];
  totalProjects: number;
  totalMembers: number;
  organizationId: string;
}

export function OrganizationSummary({
  recentProjects,
  recentChats,
  totalProjects,
  totalMembers,
  organizationId,
}: OrganizationSummaryProps) {
  return (
    <div className="space-y-10">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projekty</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">Aktywnych projektów</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Członkowie</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Członków organizacji
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Czaty</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentChats.length}</div>
            <p className="text-xs text-muted-foreground">
              Ostatnie konwersacje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ostatnie projekty</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/organizations/${organizationId}/projects`}>
              Zobacz wszystkie
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recentProjects.slice(0, 6).map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                iri={project["@id"]}
                name={project.name}
                organizationId={organizationId}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Brak projektów</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Chats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ostatnie czaty</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/organizations/${organizationId}/chats`}>
              Zobacz wszystkie
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {recentChats.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recentChats.slice(0, 4).map((chat) => (
              <Link
                key={chat.id}
                href={`/organizations/${organizationId}/chats/${chat.id}`}
              >
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{chat.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" />
                      {chat.type === "general" && "Czat ogólny"}
                      {chat.type === "direct" && "Wiadomość bezpośrednia"}
                      {chat.type === "group" && "Czat grupowy"}
                      {chat.lastMessageAt && (
                        <>
                          <span>•</span>
                          <span suppressHydrationWarning>
                            {formatDistanceToNow(new Date(chat.lastMessageAt))}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Brak czatów</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
