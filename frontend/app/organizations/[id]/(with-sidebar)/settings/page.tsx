import React from "react";

import { PageHeader } from "@/components/PageHeader";

export default async function OrganizationSettingsPage() {
  return (
    <div className="p-4 space-y-6">
      <PageHeader
        title="Ustawienia"
        description="Zmień ustawienia organizacji"
      />
    </div>
  );
}
