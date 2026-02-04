import { Trash2 } from "lucide-react";
import React, { useState } from "react";

import { DeleteIssueDialog } from "@/components/IssueDetails/SoftDelete/DeleteIssueDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SoftDeleteContainerProps {
  issueId?: number | string;
  projectId?: number | string;
}

export function IssueSoftDeleteContainer({
  issueId,
  projectId,
}: SoftDeleteContainerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Card className="bg-destructive/10 border border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-destructive">
            <h3>Strefa niebezpieczna</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-destructive">Usuń zadanie</h4>
            <p className="text-sm text-destructive/80">
              Zadanie zostanie usuniętę i nie będzie dostępne dla użytkowników.
              Wszelkie załączniki nie będą mogły być odzyskane.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Usuń zadanie
          </Button>
        </CardContent>
      </Card>

      <DeleteIssueDialog
        issueId={issueId}
        projectId={projectId}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
