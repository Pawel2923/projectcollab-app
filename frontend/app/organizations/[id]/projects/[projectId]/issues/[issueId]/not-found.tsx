import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

export default function IssueNotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Nie znaleziono zadania</h2>
        <p className="text-sm text-muted-foreground">
          Zadanie, którego szukasz, mogło zostać usunięte lub nie masz do niego
          dostępu.
        </p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/organizations">Wróć do listy organizacji</Link>
      </Button>
    </div>
  );
}
