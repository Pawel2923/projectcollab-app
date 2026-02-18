import { Download, FileText, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAlert } from "@/hooks/useAlert";
import {
  deleteReport,
  generateReport,
  getReports,
} from "@/services/report/report-service";
import type { Report } from "@/types/api/report";

export function ReportsTab() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { notify } = useAlert();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [type, setType] = useState("activity");
  const [format, setFormat] = useState("pdf");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const result = await getReports(projectId);
    if (result.ok) {
      setReports(result.value.member);
    } else {
      notify({
        type: "destructive",
        title: "Błąd",
        description: "Nie udało się pobrać raportów.",
      });
    }
    setLoading(false);
  }, [projectId, notify]);

  useEffect(() => {
    if (projectId) {
      loadReports();
    }
  }, [projectId, loadReports]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    const result = await generateReport(
      projectId,
      type,
      format,
      dateFrom,
      dateTo,
    );
    if (result.ok) {
      notify({
        type: "default",
        title: "Sukces",
        description: "Raport został wygenerowany.",
      });
      await loadReports();
    } else {
      notify({
        type: "destructive",
        title: "Błąd",
        description: "Nie udało się wygenerować raportu.",
      });
    }
    setGenerating(false);
  };

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;

    const result = await deleteReport(reportToDelete);
    if (result.ok) {
      notify({
        type: "default",
        title: "Sukces",
        description: "Raport został usunięty.",
      });
      setReports(reports.filter((r) => r.id !== reportToDelete));
    } else {
      notify({
        type: "destructive",
        title: "Błąd",
        description: "Nie udało się usunąć raportu.",
      });
    }
    setReportToDelete(null);
  };

  return (
    <div className="grid gap-6 md:grid-cols-12">
      {/* Left Panel: Generate New Report */}
      <div className="md:col-span-4 space-y-10">
        <Card>
          <CardHeader>
            <CardTitle>Konfiguracja Raportu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Typ Raportu</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Wybierz typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">Raport Aktywności</SelectItem>
                  <SelectItem value="progress">Raport Postępu</SelectItem>
                  <SelectItem value="time">Raport Czasu Pracy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Zakres Dat</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Od</span>
                  <Input
                    type="date"
                    className="block"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Do</span>
                  <Input
                    type="date"
                    className="block"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Wybierz format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary-hover mt-4"
              onClick={handleGenerateReport}
              disabled={generating}
            >
              {generating ? "Generowanie..." : "Generuj Raport"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Recent Reports */}
      <div className="md:col-span-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Historia Raportów</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Ładowanie...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Brak wygenerowanych raportów.
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa Raportu</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Data Utworzenia</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {report.name}
                        </TableCell>
                        <TableCell>
                          {{
                            activity: "Aktywność",
                            progress: "Postęp",
                            time: "Czas pracy",
                          }[report.type] || report.type}
                        </TableCell>
                        <TableCell>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL}${report.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setReportToDelete(report.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!reportToDelete}
        onOpenChange={(open) => !open && setReportToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć. Raport zostanie trwale usunięty.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteReport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
