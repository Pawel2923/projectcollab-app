<?php

namespace App\State\Report;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\DTO\ReportGenerateInput;
use App\Entity\Project;
use App\Entity\Report;
use App\Repository\IssueRepository;
use App\Repository\ProjectRepository;
use App\Repository\SprintRepository;
use App\Service\ReportExportService;
use DateMalformedStringException;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class ReportGenerateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ProjectRepository      $projectRepository,
        private IssueRepository        $issueRepository,
        private SprintRepository       $sprintRepository,
        private ReportExportService    $reportExportService,
        #[Autowire('%kernel.project_dir%/public/reports')]
        private string                 $reportsDir
    ) {
    }

    /**
     * @param ReportGenerateInput $data
     * @throws DateMalformedStringException
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Report
    {
        if (!$data instanceof ReportGenerateInput) {
            throw new BadRequestHttpException('Invalid data type');
        }

        $projectId = $data->projectId;
        $type = $data->type ?? 'activity';
        $format = $data->format ?? 'pdf';
        $dateFrom = $data->dateFrom ?? null;
        $dateTo = $data->dateTo ?? null;

        if (!$projectId) {
            throw new BadRequestHttpException('Project ID is required');
        }

        $project = $this->projectRepository->find($projectId);
        if (!$project) {
            throw new NotFoundHttpException('Project not found');
        }

        if (!file_exists($this->reportsDir)) {
            mkdir($this->reportsDir, 0777, true);
        }

        $filename = sprintf(
            '%s_%s_%s.%s',
            $type,
            $project->getId(),
            date('YmdHis'),
            $format
        );
        $filePath = $this->reportsDir . '/' . $filename;

        $reportData = $this->getReportData($project, $type, $dateFrom, $dateTo);

        if ($format === 'pdf') {
            $this->reportExportService->generatePdf($filePath, $project, $type, $reportData, $dateFrom, $dateTo);
        } elseif ($format === 'csv') {
            $this->reportExportService->generateCsv($filePath, $project, $type, $reportData);
        } elseif ($format === 'xlsx') {
            $this->reportExportService->generateXlsx($filePath, $project, $type, $reportData);
        } else {
            file_put_contents($filePath, "Unsupported format: $format");
        }

        $report = new Report();
        $report->setName($filename);
        $report->setType($type);
        $report->setFormat($format);
        $report->setProject($project);
        $report->setFileUrl('/reports/' . $filename);

        $this->entityManager->persist($report);
        $this->entityManager->flush();

        return $report;
    }

    /**
     * @throws DateMalformedStringException
     */
    private function getReportData(Project $project, string $type, ?string $dateFrom, ?string $dateTo): array
    {
        $data = [];

        switch ($type) {
            case 'activity':
                $qb = $this->issueRepository->createQueryBuilder('i')
                    ->where('i.project = :project')
                    ->setParameter('project', $project)
                    ->orderBy('i.updatedAt', 'DESC')
                    ->setMaxResults(50);

                if ($dateFrom) {
                    $qb->andWhere('i.updatedAt >= :dateFrom')
                        ->setParameter('dateFrom', new DateTime($dateFrom));
                }
                if ($dateTo) {
                    $qb->andWhere('i.updatedAt <= :dateTo')
                        ->setParameter('dateTo', new DateTime($dateTo . ' 23:59:59'));
                }

                $data = $qb->getQuery()->getResult();
                break;

            case 'progress':
                $data = $this->sprintRepository->findBy(['project' => $project], ['startDate' => 'DESC']);
                break;

            case 'time':
                $qb = $this->issueRepository->createQueryBuilder('i')
                    ->where('i.project = :project')
                    ->andWhere('i.loggedTime > 0')
                    ->setParameter('project', $project)
                    ->orderBy('i.updatedAt', 'DESC');

                $data = $qb->getQuery()->getResult();
                break;
        }

        return $data;
    }
}
