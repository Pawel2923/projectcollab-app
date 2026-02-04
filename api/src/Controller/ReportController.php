<?php

namespace App\Controller;

use App\Entity\Project;
use App\Entity\Report;
use App\Repository\IssueRepository;
use App\Repository\ProjectRepository;
use App\Repository\SprintRepository;
use App\Service\ReportExportService;
use DateMalformedStringException;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Annotation\Route;

#[AsController]
class ReportController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ProjectRepository      $projectRepository,
        private readonly IssueRepository        $issueRepository,
        private readonly SprintRepository       $sprintRepository,
        private readonly ReportExportService    $reportExportService,
        #[Autowire('%kernel.project_dir%/public/reports')]
        private readonly string                 $reportsDir
    )
    {
    }

    /**
     * @throws DateMalformedStringException
     */
    #[Route('/reports/generate', name: 'api_reports_generate', methods: ['POST'])]
    public function generate(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $projectId = $data['projectId'] ?? null;
        $type = $data['type'] ?? 'activity';
        $format = $data['format'] ?? 'pdf';
        $dateFrom = $data['dateFrom'] ?? null;
        $dateTo = $data['dateTo'] ?? null;

        if (!$projectId) {
            return $this->json(['error' => 'Project ID is required'], Response::HTTP_BAD_REQUEST);
        }

        $project = $this->projectRepository->find($projectId);
        if (!$project) {
            return $this->json(['error' => 'Project not found'], Response::HTTP_NOT_FOUND);
        }

        // Ensure reports directory exists
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

        return $this->json($report, Response::HTTP_CREATED, [], ['groups' => ['report:read']]);
    }

    /**
     * @throws DateMalformedStringException
     */
    private function getReportData(Project $project, string $type, ?string $dateFrom, ?string $dateTo): array
    {
        $data = [];

        switch ($type) {
            case 'activity':
                // Fetch recently updated issues
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
                // Fetch sprints
                $data = $this->sprintRepository->findBy(['project' => $project], ['startDate' => 'DESC']);
                break;

            case 'time':
                // Fetch issues with logged time
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
