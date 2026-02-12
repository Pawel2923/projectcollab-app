"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { GanttTab } from "@/components/Project/Summary/GanttTab";
import { OverviewTab } from "@/components/Project/Summary/OverviewTab";
import { ReportsTab } from "@/components/Project/Summary/ReportsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Issue, IssueStatus } from "@/types/api/issue";
import type { Sprint } from "@/types/api/sprint";

interface SummaryTabsProps {
  issues: Issue[];
  sprints: Sprint[];
  statuses: IssueStatus[];
  now?: number;
  oAuthProviders?: string[];
  lastSyncedAt?: string;
}

export function SummaryTabs({
  issues,
  sprints,
  statuses,
  now,
  oAuthProviders,
  lastSyncedAt,
}: SummaryTabsProps) {
  const router = useRouter();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview",
  );

  useEffect(() => {
    const tab = searchParams.get("tab") || "overview";
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    const params = new URLSearchParams(searchParams);
    if (value === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="overview">Przegląd</TabsTrigger>
        <TabsTrigger value="gantt">Harmonogram Gantta</TabsTrigger>
        <TabsTrigger value="reports">Raporty</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <OverviewTab issues={issues} statuses={statuses} now={now} />
      </TabsContent>

      <TabsContent value="gantt" className="space-y-4">
        <GanttTab
          issues={issues}
          sprints={sprints}
          statuses={statuses}
          now={now}
          oAuthProviders={oAuthProviders}
          lastSyncedAt={lastSyncedAt}
        />
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <ReportsTab />
      </TabsContent>
    </Tabs>
  );
}
