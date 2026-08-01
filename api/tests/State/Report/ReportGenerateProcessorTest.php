<?php

namespace App\Tests\State\Report;

use ApiPlatform\Metadata\Post;
use App\DTO\ReportGenerateInput;
use App\Entity\Project;
use App\Entity\Report;
use App\Repository\IssueRepository;
use App\Repository\ProjectRepository;
use App\Repository\SprintRepository;
use App\Service\ReportExportService;
use App\State\Report\ReportGenerateProcessor;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ReportGenerateProcessorTest extends TestCase
{
    public function testProcessThrowsBadRequestWhenDataInvalid(): void
    {
        $processor = new ReportGenerateProcessor(
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(ProjectRepository::class),
            $this->createMock(IssueRepository::class),
            $this->createMock(SprintRepository::class),
            $this->createMock(ReportExportService::class),
            sys_get_temp_dir()
        );

        $this->expectException(BadRequestHttpException::class);
        $processor->process(new \stdClass(), new Post());
    }

    public function testProcessThrowsBadRequestWhenProjectIdMissing(): void
    {
        $processor = new ReportGenerateProcessor(
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(ProjectRepository::class),
            $this->createMock(IssueRepository::class),
            $this->createMock(SprintRepository::class),
            $this->createMock(ReportExportService::class),
            sys_get_temp_dir()
        );

        $input = new ReportGenerateInput();
        $input->projectId = null;

        $this->expectException(BadRequestHttpException::class);
        $processor->process($input, new Post());
    }

    public function testProcessThrowsNotFoundWhenProjectDoesNotExist(): void
    {
        $projectRepo = $this->createMock(ProjectRepository::class);
        $projectRepo->method('find')->with(999)->willReturn(null);

        $processor = new ReportGenerateProcessor(
            $this->createMock(EntityManagerInterface::class),
            $projectRepo,
            $this->createMock(IssueRepository::class),
            $this->createMock(SprintRepository::class),
            $this->createMock(ReportExportService::class),
            sys_get_temp_dir()
        );

        $input = new ReportGenerateInput();
        $input->projectId = 999;

        $this->expectException(NotFoundHttpException::class);
        $processor->process($input, new Post());
    }

    public function testProcessGeneratesAndReturnsReport(): void
    {
        $project = new Project();
        $reflection = new \ReflectionClass(Project::class);
        $property = $reflection->getProperty('id');
        $property->setAccessible(true);
        $property->setValue($project, 123);

        $projectRepo = $this->createMock(ProjectRepository::class);
        $projectRepo->method('find')->with(123)->willReturn($project);

        $sprintRepo = $this->createMock(SprintRepository::class);
        $sprintRepo->method('findBy')->willReturn([]);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->once())->method('persist');
        $em->expects($this->once())->method('flush');

        $exportService = $this->createMock(ReportExportService::class);
        $exportService->expects($this->once())->method('generatePdf');

        $processor = new ReportGenerateProcessor(
            $em,
            $projectRepo,
            $this->createMock(IssueRepository::class),
            $sprintRepo,
            $exportService,
            sys_get_temp_dir()
        );

        $input = new ReportGenerateInput();
        $input->projectId = 123;
        $input->type = 'progress';
        $input->format = 'pdf';

        $report = $processor->process($input, new Post());

        $this->assertInstanceOf(Report::class, $report);
        $this->assertEquals('progress', $report->getType());
        $this->assertEquals('pdf', $report->getFormat());
        $this->assertEquals($project, $report->getProject());
    }
}
