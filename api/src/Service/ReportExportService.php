<?php

namespace App\Service;

use App\Entity\Project;
use Dompdf\Dompdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReportExportService
{
    public function generatePdf(string $filePath, Project $project, string $type, array $data, ?string $dateFrom, ?string $dateTo): void
    {
        $dompdf = new Dompdf();

        $typeMap = [
            'activity' => 'Aktywność',
            'progress' => 'Postęp',
            'time' => 'Czas pracy',
        ];
        $polishType = $typeMap[$type] ?? ucfirst($type);

        $html = '
        <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
            <style>
                body { font-family: "DejaVu Sans", sans-serif; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; }
            </style>
        </head>
        <body>';
        $html .= "<h1>Raport: " . $polishType . "</h1>";
        $html .= "<p><strong>Projekt:</strong> " . $project->getName() . "</p>";
        $html .= "<p><strong>Data wygenerowania:</strong> " . date('Y-m-d H:i:s') . "</p>";
        if ($dateFrom && $dateTo) {
            $html .= "<p><strong>Zakres:</strong> $dateFrom - $dateTo</p>";
        }
        $html .= "<hr>";

        if (empty($data)) {
            $html .= "<p>Brak danych do wyświetlenia dla wybranych kryteriów.</p>";
        } else {
            if ($type === 'activity') {
                $html .= '<table>
                    <thead>
                        <tr>
                            <th>Klucz</th>
                            <th>Tytuł</th>
                            <th>Status</th>
                            <th>Data aktualizacji</th>
                        </tr>
                    </thead>
                    <tbody>';
                foreach ($data as $issue) {
                    $html .= '<tr>
                        <td>' . $issue->getKey() . '</td>
                        <td>' . $issue->getTitle() . '</td>
                        <td>' . ($issue->getStatus() ? $issue->getStatus()->getValue() : '-') . '</td>
                        <td>' . ($issue->getUpdatedAt() ? $issue->getUpdatedAt()->format('Y-m-d H:i') : '-') . '</td>
                    </tr>';
                }
                $html .= '</tbody></table>';
            } elseif ($type === 'progress') {
                $html .= '<table>
                    <thead>
                        <tr>
                            <th>Sprint</th>
                            <th>Cel</th>
                            <th>Status</th>
                            <th>Data zakończenia</th>
                        </tr>
                    </thead>
                    <tbody>';
                foreach ($data as $sprint) {
                    $html .= '<tr>
                        <td>' . $sprint->getName() . '</td>
                        <td>' . ($sprint->getGoal() ?: '-') . '</td>
                        <td>' . ($sprint->getStatus() ? $sprint->getStatus()->value : '-') . '</td>
                        <td>' . ($sprint->getEndDate() ? $sprint->getEndDate()->format('Y-m-d') : '-') . '</td>
                    </tr>';
                }
                $html .= '</tbody></table>';
            } elseif ($type === 'time') {
                $html .= '<table>
                    <thead>
                        <tr>
                            <th>Klucz</th>
                            <th>Tytuł</th>
                            <th>Szacowany (min)</th>
                            <th>Zalogowany (min)</th>
                        </tr>
                    </thead>
                    <tbody>';
                $totalLogged = 0;
                foreach ($data as $issue) {
                    $html .= '<tr>
                        <td>' . $issue->getKey() . '</td>
                        <td>' . $issue->getTitle() . '</td>
                        <td>' . ($issue->getEstimated() ?: 0) . '</td>
                        <td>' . ($issue->getLoggedTime() ?: 0) . '</td>
                    </tr>';
                    $totalLogged += ($issue->getLoggedTime() ?: 0);
                }
                $html .= '</tbody></table>';
                $html .= '<p style="margin-top: 20px; font-weight: bold;">Całkowity czas zalogowany: ' . $totalLogged . ' min (' . round($totalLogged / 60, 1) . ' h)</p>';
            }
        }

        $html .= '</body></html>';

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();

        file_put_contents($filePath, $dompdf->output());
    }

    public function generateCsv(string $filePath, Project $project, string $type, array $data): void
    {
        $fp = fopen($filePath, 'w');

        fputs($fp, "\xEF\xBB\xBF");

        if ($type === 'activity') {
            fputcsv($fp, ['Klucz', 'Tytuł', 'Status', 'Data aktualizacji']);
            foreach ($data as $issue) {
                fputcsv($fp, [
                    $issue->getKey(),
                    $issue->getTitle(),
                    $issue->getStatus() ? $issue->getStatus()->getValue() : '-',
                    $issue->getUpdatedAt() ? $issue->getUpdatedAt()->format('Y-m-d H:i') : '-'
                ]);
            }
        } elseif ($type === 'progress') {
            fputcsv($fp, ['Sprint', 'Cel', 'Status', 'Data zakończenia']);
            foreach ($data as $sprint) {
                fputcsv($fp, [
                    $sprint->getName(),
                    $sprint->getGoal() ?: '-',
                    $sprint->getStatus() ? $sprint->getStatus()->value : '-',
                    $sprint->getEndDate() ? $sprint->getEndDate()->format('Y-m-d') : '-'
                ]);
            }
        } elseif ($type === 'time') {
            fputcsv($fp, ['Klucz', 'Tytuł', 'Szacowany (min)', 'Zalogowany (min)']);
            $totalLogged = 0;
            foreach ($data as $issue) {
                fputcsv($fp, [
                    $issue->getKey(),
                    $issue->getTitle(),
                    $issue->getEstimated() ?: 0,
                    $issue->getLoggedTime() ?: 0
                ]);
                $totalLogged += ($issue->getLoggedTime() ?: 0);
            }
            fputcsv($fp, []);
            fputcsv($fp, ['Całkowity czas zalogowany', $totalLogged]);
        }

        fclose($fp);
    }

    public function generateXlsx(string $filePath, Project $project, string $type, array $data): void
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        if ($type === 'activity') {
            $sheet->setCellValue('A1', 'Klucz');
            $sheet->setCellValue('B1', 'Tytuł');
            $sheet->setCellValue('C1', 'Status');
            $sheet->setCellValue('D1', 'Data aktualizacji');

            $row = 2;
            foreach ($data as $issue) {
                $sheet->setCellValue('A' . $row, $issue->getKey());
                $sheet->setCellValue('B' . $row, $issue->getTitle());
                $sheet->setCellValue('C' . $row, $issue->getStatus() ? $issue->getStatus()->getValue() : '-');
                $sheet->setCellValue('D' . $row, $issue->getUpdatedAt() ? $issue->getUpdatedAt()->format('Y-m-d H:i') : '-');
                $row++;
            }
        } elseif ($type === 'progress') {
            $sheet->setCellValue('A1', 'Sprint');
            $sheet->setCellValue('B1', 'Cel');
            $sheet->setCellValue('C1', 'Status');
            $sheet->setCellValue('D1', 'Data zakończenia');

            $row = 2;
            foreach ($data as $sprint) {
                $sheet->setCellValue('A' . $row, $sprint->getName());
                $sheet->setCellValue('B' . $row, $sprint->getGoal() ?: '-');
                $sheet->setCellValue('C' . $row, $sprint->getStatus() ? $sprint->getStatus()->value : '-');
                $sheet->setCellValue('D' . $row, $sprint->getEndDate() ? $sprint->getEndDate()->format('Y-m-d') : '-');
                $row++;
            }
        } elseif ($type === 'time') {
            $sheet->setCellValue('A1', 'Klucz');
            $sheet->setCellValue('B1', 'Tytuł');
            $sheet->setCellValue('C1', 'Szacowany (min)');
            $sheet->setCellValue('D1', 'Zalogowany (min)');

            $row = 2;
            $totalLogged = 0;
            foreach ($data as $issue) {
                $sheet->setCellValue('A' . $row, $issue->getKey());
                $sheet->setCellValue('B' . $row, $issue->getTitle());
                $sheet->setCellValue('C' . $row, $issue->getEstimated() ?: 0);
                $sheet->setCellValue('D' . $row, $issue->getLoggedTime() ?: 0);
                $totalLogged += ($issue->getLoggedTime() ?: 0);
                $row++;
            }
            $row++;
            $sheet->setCellValue('C' . $row, 'Całkowity czas zalogowany');
            $sheet->setCellValue('D' . $row, $totalLogged);
        }

        foreach (range('A', 'D') as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
    }
}
